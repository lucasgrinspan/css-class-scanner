import yargs from "yargs";

/**
 * Creates the CLI interface
 */
export const cli = yargs(process.argv.slice(2))
  .command(
    "$0 <stylesheet> [url]",
    "Scan the website for class names from a stylesheet",
    (yargs) => {
      yargs.positional("stylesheet", {
        describe: "URL or path to stylesheet for reference",
        type: "string",
      });
      yargs.positional("url", {
        describe: "the URL for the site that will be scanned",
        type: "string",
      });
    }
  )
  .option("sites", {
    alias: "s",
    describe: "Path to file containing line delimitted list of sites to scan",
  })
  .help()
  .example([
    ["$0 example.com/main.css example.com", "Scans example.com"],
    ["$0 example.com/main.css -s urls.txt", "Scans the sites in urls.txt"],
  ]).argv;
