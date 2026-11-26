"""Explicit speech providers. No silent fallback from neural TTS to scratch speech."""
import json
import os
from pathlib import Path
import subprocess
import time
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen

class VoiceEngine:
    def __init__(self, engine, config):
        self.engine=engine
        self.c=config
        start=time.perf_counter()
        self.model=None
        if engine=="kokoro":
            from kokoro_onnx import Kokoro
            directory=Path(os.environ.get("KOKORO_MODEL_DIR",".cache/kokoro"))
            self.model=Kokoro(str(directory/"kokoro-v1.0.onnx"),str(directory/"voices-v1.0.bin"))
        elif engine=="voicestudio":
            if os.environ.get("VOICESTUDIO_COMMERCIAL_APPROVED")!="1":
                raise ValueError("Verify the selected VoiceStudio engine and voice rights, then set VOICESTUDIO_COMMERCIAL_APPROVED=1")
            self.url=os.environ.get("VOICESTUDIO_URL","http://127.0.0.1:3900").rstrip("/")
            u=urlparse(self.url)
            if u.scheme!="https" and not (u.scheme=="http" and u.hostname in ("localhost","127.0.0.1","::1")):
                raise ValueError("VoiceStudio requires HTTPS for remote connections")
            if u.username or u.password or u.query or u.fragment:
                raise ValueError("Invalid VoiceStudio URL")
            self.model_id=os.environ.get("VOICESTUDIO_MODEL_ID")
            self.voice_id=os.environ.get("VOICESTUDIO_VOICE_ID")
            if not self.model_id or not self.voice_id or self.model_id.startswith("eleven_") or "omnivoice" in self.model_id.lower():
                raise ValueError("Select an explicitly licensed engine and voice; no implicit/default OmniVoice engine")
        elif engine!="espeak":
            raise ValueError("Unknown voice engine")
        self.load_seconds=time.perf_counter()-start

    def synthesize(self,text,output):
        start=time.perf_counter()
        if self.engine=="kokoro":
            import soundfile as sf
            audio,rate=self.model.create(text,voice=self.c.get("kokoro_voice","am_michael"),speed=float(self.c.get("neural_speed",1.0)),lang=self.c.get("kokoro_language","en-us"))
            sf.write(str(output),audio,rate,subtype="PCM_16")
        elif self.engine=="voicestudio":
            key=os.environ.get("VOICESTUDIO_API_KEY")
            headers={"Content-Type":"application/json"}
            if key: headers["Authorization"]="Bearer "+key
            body=json.dumps({"text":text,"model_id":self.model_id,"language_code":self.c.get("language","en"),"voice_settings":{"speed":float(self.c.get("neural_speed",1.0))}}).encode()
            req=Request(self.url+"/elevenlabs/v1/text-to-speech/"+quote(self.voice_id,safe="")+"?output_format=wav_24000",data=body,headers=headers,method="POST")
            # Do not forward credentials across redirects.
            from urllib.request import build_opener, HTTPRedirectHandler
            class NoRedirect(HTTPRedirectHandler):
                def redirect_request(self,*args,**kwargs):
                    raise RuntimeError("Unexpected VoiceStudio redirect")
            with build_opener(NoRedirect()).open(req,timeout=300) as response:
                data=response.read(50*1024*1024+1)
            if len(data)>50*1024*1024 or data[:4]!=b"RIFF":
                raise ValueError("Invalid VoiceStudio WAV response")
            Path(output).write_bytes(data)
        else:
            subprocess.run(["espeak-ng","-v",self.c.get("voice","en-gb"),"-s",str(self.c.get("rate",165)),"-w",str(output),"--",text],check=True)
        return time.perf_counter()-start
