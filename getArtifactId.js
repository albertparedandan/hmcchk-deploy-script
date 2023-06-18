const { Octokit } = require("@octokit/core")
const fs = require('fs');

const octokit = new Octokit({
  auth: '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'
})

const downloadArtifact = async (artifactId) => {
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}', {
      owner: 'hmcc-global',
      repo: 'hmcchk-web',
      artifact_id: artifactId,
      archive_format: 'zip',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    fs.writeFileSync('download.zip', Buffer.from(data));
  } catch (err) {
    console.log(err);
  }
};

const getArtifactId = async (runId) => {
  let artifactId = 0;
  try {
    const { data: { artifacts } } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts', {
      owner: 'hmcc-global',
      repo: 'hmcchk-web',
      run_id: runId,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!artifacts || !artifacts.length) throw new Error(`No artifacts found for runId: ${runId}`);

    artifactId = artifacts[0]['id'];

    if (!artifactId) throw new Error(`Invalid artifact id received. Artifact object is: ${JSON.stringify(artifacts[0])}`);
  }
  catch (err) {
    console.log(err);
  }

  return artifactId;
};

const getRunId = () => {
  const runId = process.argv[2];
  if (!runId || runId === '') throw new Error('No runId');
  
  return runId;
};

const main = async () => {
  const runId = getRunId();
  const artifactId = await getArtifactId(runId);
  downloadArtifact(artifactId);
}

main();
