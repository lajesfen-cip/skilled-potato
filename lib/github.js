"use strict";

const https = require("https");

class NotFoundError extends Error {
  constructor(url) {
    super(`not found: ${url}`);
    this.name = "NotFoundError";
  }
}

function authHeaders(env = process.env) {
  const token = env.GITHUB_TOKEN;
  return token ? { Authorization: `token ${token}` } : {};
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "skilled-potato-cli", ...authHeaders() } }, (res) => {
        if (res.statusCode === 404) {
          res.resume();
          reject(new NotFoundError(url));
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`request failed (${res.statusCode}): ${url}`));
          return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function fetchJSON(url) {
  return JSON.parse(await fetchText(url));
}

module.exports = { fetchText, fetchJSON, NotFoundError };
