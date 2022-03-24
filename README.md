# CSS Class Scanner

This is a small command line utility to analyze CSS classes usage on a list of sites. The utility compares the classes from the sites against the classes defined in the provided stylesheet. This is useful if you own a component library and you want to gain insight into the usage of CSS classes or components on published websites.

**CLI**
<img width="1116" alt="image" src="https://user-images.githubusercontent.com/32201603/154773934-691c5a5a-e5ac-4197-b4a5-50482f60b089.png">

**Chrome Extension**
<img width="1094" alt="image" src="https://user-images.githubusercontent.com/32201603/159837224-f378addb-a62e-44a0-b3d4-994e5b06a938.png">


## Usage

The core functionality is offered in a CLI or as a Chrome extension. Use the CLI to quickly scan pages with server generated content. Use the Chrome extension to scan class names of websites that use client-side rendering or require authentication.

### CLI

The first positional argument is required and must be a URL to the stylesheet. The second positional argument is the site to scan. Alternatively, you can use the `-s path/to/file.txt` to provide a list of sites to scan. In that file, each URL must be on its own line.

Run the command below in the repository folder for a quick demo. `test/sites.txt` is provided in this repo and contains a list of sites. The URL is a link to the stylesheet that provides the class names for those sites.

```bash
$ npm i
$ node src/main.js https://lucasgrinspan.github.io/MangoUI/dist/mango.css -s test/sites.txt
```

This command will generate two files: `classes_used.csv` and `classes_unused.csv`. The first is a CSV where the first column is the class name and the second column is the frequency, or how often it's used. The second file is a list of all classes found in the stylesheet that weren't used in the site.

```
main.js <stylesheet> [url]

Scan the website for class names from a stylesheet

Positionals:
  stylesheet                                                            [string]
  url                                                                   [string]

Options:
      --version  Show version number                                   [boolean]
  -s, --sites    Path to file containing line delimitted list of sites to scan
      --help     Show help                                             [boolean]

Examples:
  main.js example.com/main.css example.com  Scans example.com
  main.js example.com/main.css -s urls.txt  Scans the sites in urls.txt
```

### Chrome Extension

If developer mode is enabled, you can load `manifest.json` file as an unpacked extension. Once installed, you can enter the stylesheet in the GUI and press the "Take Snapshot" button to scan the page currently in view. From here, you can navigate to the next page and take more snapshots. Once all of the pages have been scanned, use the "Export" button to download the scanned class names as a CSV file.

