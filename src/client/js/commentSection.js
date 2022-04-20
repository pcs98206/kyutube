const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll(".video__comment-deleteBtn");

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment ";
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    const span2 = document.createElement("span");
    span2.className ="video__comment-deleteBtn";
    span2.innerText = ` ❌`;
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
    span2.addEventListener("click", handleDelete);
};


const handleDelete = async(event) => {
    const li = event.target.parentElement;
    const commentId = li.dataset.id;
    const response = await fetch(`/api/videos/${commentId}/deleteComment`,{
        method: 'delete'
    });
    if(response.status === 200){
        li.remove();
    };
};

const handleSubmit = async (event) => {
    const textarea = form.querySelector("textarea");
    event.preventDefault();
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === ""){
        return;
    };
    const response =  await fetch(`/api/videos/${videoId}/comment`,{
        method: 'post',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({text})
    });
    if(response.status === 201){
        textarea.value = "";
        const {newCommentId} = await response.json();
        addComment(text, newCommentId);
    };
};

if(form){
    form.addEventListener("submit", handleSubmit);
};

deleteBtns.forEach(deleteBtn => {
    deleteBtn.addEventListener("click", handleDelete);
});