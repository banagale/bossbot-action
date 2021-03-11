module.exports = async function filterEmailChain(issueComment, cleanupMessage) {
  if (typeof issueComment != 'string') {
    throw new TypeError('filterEmailChain expects a string');
  }

  const filterReply = async (issueComment) => {
    /**
     * Remove email chains from an issue comment
     * Handles Outlook and Gmail
     * @type {RegExp}
     */
    const filterEmailChain = require('./cleanupMessage');

    const OUTLOOK_EMAIL_REGEX = /^\s*(From:.*[^]*)\b(?:unsubscribe.)$/gm;
    const GMAIL_EMAIL_REGEX = /^\s*(on .*[^]*)\b(wrote:.*[^]*)+(reply to this email directly,.*[^]*)+>(.*\s*)$/gm;

    if (issueComment.match(OUTLOOK_EMAIL_REGEX) !== null) {
      console.log('Filtering issue comment for outlook remenants');

      const filteredComment = async () => {
        // Remove email clutter
        let draftUpdatedComment = issueComment.replace(OUTLOOK_EMAIL_REGEX, '');
        // Optionally perform additional message cleanup
        if (cleanupComment) {
          draftUpdatedComment = await cleanupMessage(draftUpdatedComment);
        }
        return draftUpdatedComment;
      };
      return await filteredComment();
    } else if (issueComment.match(GMAIL_EMAIL_REGEX) !== null) {
      console.log('Filtering issue comment for gmail remenants');
      const filteredComment = async () => {
        return issueComment.replace(GMAIL_EMAIL_REGEX, '');
      };
      return await filteredComment();
    } else {
      console.log('No email reply detected');
      return false;
    }
  };

  const filterBoss = async (updatedComment) => {
    /**
     * Remove any previous BossBot annotations
     * @type {RegExp}
     */
    const BOSS_COPY_REGEX = /^ *(Edited by .*🤖)\s*$/gm;
    if (updatedComment.match(BOSS_COPY_REGEX) !== null) {
      return updatedComment.replace(BOSS_COPY_REGEX, '');
    } else {
      return updatedComment;
    }
  };

  const updatedComment = await filterReply(issueComment, cleanupComment);

  if (updatedComment !== false) {
    return await filterBoss(updatedComment, cleanupMessage);
  } else {
    return updatedComment;
  }
};
