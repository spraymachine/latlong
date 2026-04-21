export function getEarthModelSrc(
  isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true",
) {
  return `${isGitHubPagesBuild ? "/latlong" : ""}/Earth_1_12756.glb`
}

export const EARTH_MODEL_SRC = getEarthModelSrc()
