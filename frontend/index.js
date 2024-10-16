import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, canisterId } from "declarations/backend";

const postsContainer = document.getElementById("mainContent");
const loginButton = document.getElementById("loginButton");
const newPostButton = document.getElementById("newPostButton");
const newPostForm = document.getElementById("newPostForm");
const closeForm = document.getElementById("closeForm");
const submitPostButton = document.getElementById("submitPostButton");
let quill;
let backendActor;

async function init() {
  // Initialize Quill editor
  quill = new Quill("#editor", {
    theme: "snow",
  });

  // Hide new post button initially
  newPostButton.style.display = "none";

  // Create an AuthClient instance
  const authClient = await AuthClient.create();

  // Check if the user is already authenticated
  if (await authClient.isAuthenticated()) {
    handleAuthenticated(authClient);
  }

  loginButton.addEventListener("click", async () => {
    loginButton.disabled = true;
    loginButton.textContent = "Please wait...";

    await authClient.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: () => {
        handleAuthenticated(authClient);
      },
    });
  });

  newPostButton.addEventListener("click", () => {
    newPostForm.style.display = "block";
  });

  closeForm.addEventListener("click", () => {
    newPostForm.style.display = "none";
  });

  submitPostButton.addEventListener("click", async () => {
    submitPostButton.disabled = true;
    submitPostButton.textContent = "Submitting...";
    const title = document.getElementById("postTitle").value;
    const body = quill.root.innerHTML;
    try {
      await backendActor.createPost(title, body);
      await loadPosts();
      newPostForm.style.display = "none";
      document.getElementById("postTitle").value = "";
      quill.root.innerHTML = "";
    } catch (error) {
      console.error(error);
    }
    submitPostButton.disabled = false;
    submitPostButton.textContent = "Submit";
  });

  await loadPosts();
}

async function handleAuthenticated(authClient) {
  loginButton.style.display = "none";
  newPostButton.style.display = "inline-block";

  const identity = authClient.getIdentity();
  const agent = new HttpAgent({ identity });

  // Fetch root key for certificate validation during development
  // Remove this line in production
  await agent.fetchRootKey();

  backendActor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });

  await loadPosts();
}

async function loadPosts() {
  try {
    const actor = backendActor || Actor.createActor(idlFactory, { canisterId });
    const posts = await actor.getPosts();
    postsContainer.innerHTML = "";
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-body">${post.body}</div>
        <div class="post-meta">By ${post.author.toText()} on ${new Date(Number(post.timestamp) / 1_000_000).toLocaleString()}</div>
      `;
      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    console.error(error);
  }
}

window.onload = init;
