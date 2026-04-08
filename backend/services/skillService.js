const fs = require("fs");
const path = require("path");

function getSkillPrompt(skillName) {
    const filePath = path.join(__dirname, "../../skills", `${skillName}.md`);

    if (!fs.existsSync(filePath)) {
        throw new Error("Skill not found");
    }

    return fs.readFileSync(filePath, "utf-8");
}

module.exports = { getSkillPrompt };