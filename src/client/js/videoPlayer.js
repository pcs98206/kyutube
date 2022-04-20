const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");
const fullscreenBtn = document.getElementById("fullscreen");
const fullscreenIcon = fullscreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let volumeValue = 0.5;
video.volume = volumeValue;
let controlsTimeout = null;
let controlsMoveTimeout = null;

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(14, 5);

const handlePlayClick = () => {
    if(video.paused){
        video.play();
    }else{
        video.pause();
    };
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = () => {
    if(video.muted){
        video.muted = false;
    }else{
        video.muted = true;
    };
    // volumeRange.value = video.muted ? 0 : volumeValue;
    if(video.muted){
        volumeRange.value = 0;
    }else if(!video.muted && volumeValue == 0){
        volumeValue = 0.5;
        volumeRange.value = volumeValue;
        video.volume = volumeValue;
    }else{
        volumeRange.value = volumeValue;
    };
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
};

const handleVolumeChange = (event) => {
    const { target : { value } } = event;
    if(video.muted){
        video.muted = false;
        muteBtnIcon.classList = "fas fa-volume-up";
    };
    if(value == 0){
        video.muted = true;
        muteBtnIcon.classList = "fas fa-volume-mute";
    }
    volumeValue = value;
    video.volume = value;
};

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimeLineChange = (event) => {
    video.currentTime = event.target.value;
};

const handleFullScreen = () => {
    const fullscreen = document.fullscreenElement;
    if(fullscreen){
        document.exitFullscreen();
        fullscreenIcon.classList = "fas fa-expand"
    }else{
        videoContainer.requestFullscreen();
        fullscreenIcon.classList = "fas fa-compress"
    };
};

const hideColtrols = () => videoControls.classList.remove("showing");

const handleMouseMove = (event) => {
    if(controlsTimeout){
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    };
    if(controlsMoveTimeout){
        clearTimeout(controlsMoveTimeout);
        controlsMoveTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsMoveTimeout = setTimeout(() => {
        hideColtrols();
    },3000);
};

const handleMouseLeave = (event) => {
    controlsTimeout = setTimeout(() => {
        hideColtrols();
    },3000);
};

const handleEnded = () => {
    const { id } =videoContainer.dataset;
    fetch(`/api/videos/${id}/view`, {
        method: 'post'
    });
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadeddata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimeLineChange);
fullscreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("ended", handleEnded);