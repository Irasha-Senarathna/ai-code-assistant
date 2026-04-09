const fs = require("fs");
const path = require("path");

function getSkillPrompt(skillName) {
    const filePath = path.join(__dirname, "../../skills", `${skillName}.md`);

    if (!fs.existsSync(filePath)) {
        return "You are a helpful AI assistant.";
    }

    return fs.readFileSync(filePath, "utf-8");
}

module.exports = { getSkillPrompt };