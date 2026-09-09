import { execSync } from "child_process";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const USERNAME = "Abdullah6551199";
const REPO_NAME = "ecommerce-store";

async function main() {
  console.log(`Checking if repository ${USERNAME}/${REPO_NAME} exists...`);

  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Antigravity-Ecommerce-Setup",
  };

  const getRes = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO_NAME}`, {
    headers,
  });

  if (getRes.status === 200) {
    console.log(`✅ Repository ${USERNAME}/${REPO_NAME} already exists.`);
  } else if (getRes.status === 404) {
    console.log(`Creating repository ${USERNAME}/${REPO_NAME}...`);
    const createRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: REPO_NAME,
        description: "Modern, high-performance edge e-commerce platform built with Next.js 16 and deployed on Cloudflare Workers, D1, and R2.",
        private: false,
        auto_init: false,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Failed to create GitHub repository: ${createRes.status} ${errText}`);
    }
    const created = await createRes.json();
    console.log(`✅ Created repository: ${created.html_url}`);
  } else {
    const errText = await getRes.text();
    throw new Error(`GitHub API returned unexpected status ${getRes.status}: ${errText}`);
  }

  // Push main branch to remote
  const remoteUrlWithAuth = `https://${USERNAME}:${GITHUB_TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git`;
  const cleanRemoteUrl = `https://github.com/${USERNAME}/${REPO_NAME}.git`;

  console.log("Setting remote URL and pushing to GitHub...");
  execSync(`git remote set-url origin "${remoteUrlWithAuth}"`, { stdio: "inherit" });
  execSync(`git branch -M main`, { stdio: "inherit" });
  execSync(`git push -u origin main --force`, { stdio: "inherit" });

  // Clean remote URL to not expose token in local git config
  execSync(`git remote set-url origin "${cleanRemoteUrl}"`, { stdio: "inherit" });
  console.log(`\n🎉 Successfully pushed to GitHub: ${cleanRemoteUrl}`);
}

main().catch((err) => {
  console.error("❌ GitHub setup error:", err);
  process.exit(1);
});
