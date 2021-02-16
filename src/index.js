import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    if (context.payload.issue === undefined) {
      throw new Error("Can't get issue payload. Check you trigger issue event");
    }
    const { assignees, number, user: { login: author, type } } = context.payload.issue;

    if (assignees.length > 0) {
      core.info(`Assigning author has been skipped since the issue is already assigned to someone`);
      return;
    }
    if (type === 'Bot') {
      core.info("Assigning author has been skipped since the author is a bot");
      return;
    }

    const octokit = getOctokit(token);
    const result = await octokit.issues.addAssignees({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: number,
      assignees: [author]
    });
    core.debug(JSON.stringify(result));
    core.info(`@${author} has been assigned to the issue: #${number}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
