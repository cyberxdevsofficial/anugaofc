const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const welcome = document.getElementById("welcome");

/* Welcome typing animation */
const welcomeText = "Welcome to Anuga AI";
let i = 0;
function typeWelcome(){
    if(i < welcomeText.length){
        welcome.innerHTML += welcomeText.charAt(i);
        i++;
        setTimeout(typeWelcome, 70);
    } else {
        setTimeout(()=>welcome.style.display = "none", 800);
    }
}

/* Scroll chat to bottom */
function scrollToBottom(){
    chat.scrollTop = chat.scrollHeight;
}

/* Typing animation for AI messages */
function typeMessage(el, text){
    let i = 0;
    function type(){
        if(i < text.length){
            el.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 15);
        }
    }
    type();
}

/* Add message to chat with code support */
function addMessage(text, cls){
    const div = document.createElement("div");
    div.className = "msg " + cls;

    if(cls === "ai"){
        const codeRegex = /```([\s\S]*?)```/g;
        let lastIndex = 0;
        let match;

        while((match = codeRegex.exec(text)) !== null){
            // Text before code
            if(match.index > lastIndex){
                const t = text.substring(lastIndex, match.index);
                const span = document.createElement("span");
                typeMessage(span, t);
                div.appendChild(span);
            }

            // Code block
            const codeBlock = document.createElement("pre");
            const code = document.createElement("code");
            code.textContent = match[1].trim();
            codeBlock.appendChild(code);

            // Copy button
            const copyBtn = document.createElement("button");
            copyBtn.textContent = "Copy";
            copyBtn.className = "copy-btn";
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(code.textContent);
                copyBtn.textContent = "Copied!";
                setTimeout(()=>copyBtn.textContent = "Copy",1500);
            };

            const container = document.createElement("div");
            container.style.position = "relative";
            container.appendChild(copyBtn);
            container.appendChild(codeBlock);

            div.appendChild(container);

            lastIndex = codeRegex.lastIndex;
        }

        // Remaining text after last code block
        if(lastIndex < text.length){
            const t = text.substring(lastIndex);
            const span = document.createElement("span");
            typeMessage(span, t);
            div.appendChild(span);
        }

    } else {
        div.textContent = text;
    }

    chat.appendChild(div);
    scrollToBottom();
}

/* Detect image-related prompts */
function isImagePrompt(t){
    const words = [
        "image","picture","photo","logo","design","draw","art",
        "icon","banner","poster","wallpaper","generate",
        "create image","make logo","illustration"
    ];
    t = t.toLowerCase();
    return words.some(w => t.includes(w));
}

/* Send user input */
async function send(){
    const q = input.value.trim();
    if(!q) return;

    addMessage(q, "user");
    input.value = "";

    // IMAGE ROUTE
    if(isImagePrompt(q)){
        addMessage("🎨 Generating image...", "ai");
        try {
            const url = "https://dtz-ai-api-new.vercel.app/api/ai/ai-image?prompt=" + encodeURIComponent(q);
            const res = await fetch(url);
            const data = await res.json();

            const img = document.createElement("img");
            img.src = data.url || data.image;
            img.style.maxWidth = "280px";

            const div = document.createElement("div");
            div.className = "msg ai";
            div.appendChild(img);
            chat.appendChild(div);
            scrollToBottom();
        } catch(err){
            addMessage("❌ Failed to generate image.", "ai");
        }
        return;
    }

    // TEXT ROUTE
    try {
        const url = "https://www.movanest.xyz/v2/powerbrainai?query=" + encodeURIComponent(q);
        const res = await fetch(url);
        const data = await res.json();
        addMessage(data.results || "No response.", "ai");
    } catch(err){
        addMessage("❌ Failed to fetch response.", "ai");
    }
}

/* Event listeners */
sendBtn.addEventListener("click", send);
input.addEventListener("keypress", e => {
    if(e.key === "Enter") send();
});

/* On page load */
window.onload = () => {
    typeWelcome();

    // Delay initial AI greeting after welcome animation
    setTimeout(() => {
        addMessage("Hello! How can I help you today?", "ai");
    }, welcomeText.length * 70 + 500);
};
