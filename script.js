
const form = document.getElementById("searchForm");
const profile = document.getElementById("profile");
const repos = document.getElementById("repos");
const message = document.getElementById("message");
const themeBtn = document.getElementById("themeBtn");

// Restore saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark")
      ? "dark"
      : "light"
  );
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document
    .getElementById("username").value.trim();

  profile.replaceChildren();
  repos.replaceChildren();
  message.textContent = "Loading...";

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`
    );

    if (response.status === 404) {
      alert("GitHub username not found!");
      message.textContent = "User not found.";
      return;
    }

    if (!response.ok) {
      throw new Error("Unable to retrieve profile.");
    }

    const user = await response.json();

    const repoResponse = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&type=owner`
    );

    if (!repoResponse.ok) {
      throw new Error("Unable to retrieve repositories.");
    }

    const repoData = await repoResponse.json();

    message.textContent = "";

    const card = document.createElement("div");
    card.className = "profile-card";

    const avatar = document.createElement("img");
    avatar.src = user.avatar_url;
    avatar.alt = `${user.login}'s avatar`;

    const name = document.createElement("h2");
    name.textContent = user.login;

    const stats = document.createElement("p");
    stats.textContent =
      `Followers: ${user.followers} | Repositories: ${user.public_repos}`;

    card.append(avatar, name, stats);
    profile.append(card);

    // Rank by combined stars and forks
    const topRepos = repoData
      .sort((a, b) =>
        (b.stargazers_count + b.forks_count) -
        (a.stargazers_count + a.forks_count)
      )
      .slice(0, 4);

    const heading = document.createElement("h2");
    heading.textContent = "Top 4 Repositories";
    repos.append(heading);

    topRepos.forEach((repo) => {
      const repoCard = document.createElement("div");
      repoCard.className = "repo-card";

      const link = document.createElement("a");
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = repo.name;

      const details = document.createElement("p");
      details.textContent =
        `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}`;

      repoCard.append(link, details);
      repos.append(repoCard);
    });

  } catch (error) {
    message.textContent = error.message;
  }
});
  