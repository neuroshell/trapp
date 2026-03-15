const fs = require("fs");
const path = require("path");

// Simple YAML syntax validator (checks for basic structure)
function validateWorkflow(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Check for common YAML issues
  const errors = [];

  // Check for tabs (YAML requires spaces)
  if (content.includes("\t")) {
    errors.push("Contains tabs (YAML requires spaces)");
  }

  // Check for proper structure
  const lines = content.split("\n");
  let indentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith("#")) continue;

    // Check for secrets. in if: conditions at job level
    if (line.includes("if:") && line.includes("secrets.")) {
      // Check if this is at job level (no leading spaces or minimal indentation)
      const leadingSpaces = line.search(/\S/);
      if (leadingSpaces <= 4) {
        errors.push(
          `Line ${lineNum}: 'secrets.' cannot be used in job-level if conditions`,
        );
      }
    }
  }

  return errors;
}

const workflows = [
  ".github/workflows/ci.yml",
  ".github/workflows/cd-mobile.yml",
  ".github/workflows/cd-web.yml",
  ".github/workflows/security-scan.yml",
  ".github/workflows/agents-pipeline.yml",
];

let allValid = true;

console.log("Validating GitHub Actions workflows...\n");

workflows.forEach((workflow) => {
  const filePath = path.join(__dirname, "..", workflow);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${workflow} - NOT FOUND`);
    allValid = false;
    return;
  }

  const errors = validateWorkflow(filePath);

  if (errors.length === 0) {
    console.log(`✅ ${workflow} - VALID`);
  } else {
    console.log(`❌ ${workflow} - ERRORS:`);
    errors.forEach((err) => console.log(`   - ${err}`));
    allValid = false;
  }
});

console.log("\n" + "=".repeat(50));
if (allValid) {
  console.log("✅ All workflows are valid!");
  process.exit(0);
} else {
  console.log("❌ Some workflows have errors");
  process.exit(1);
}
