import { useEffect, useRef } from "react";

export default function useAudioUnlock(audioRefs){
    const unlocked =useRef(false);

    useEffect(()=>{
        const unlock = () =>{
            if(unlocked.current) return;

            Object.values(audioRefs.current).forEach(audio =>{
                try{
                    audio.volume = 0;
                    audio.play().then(()=>{
                        audio.pause();
                        audio.currenTime = 0;
                        audio.volume = 1;
                    }).catch(()=>{});
                }catch{}
            });
            unlocked.current = true;
            window.removeEventListener("click", unlock);
            window.removeEventListener("keydown", unlock);
        };

        return() =>{
            window.removeEventListener("click", unlock);
            window.removeEventListener("keydown", unlock);
        };
    }, [audioRefs])
}