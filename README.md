# se-notd-dl

Utility for downloading the Swedish Name of the day list by scraping the Svenska Akademiens web site.

## Requirements

To use this utility you must have [nodejs](https://nodejs.org) installed. This utility has been developed with nodejs 
version 4.4.3.

## Installation

```sh
git clone https://github.com/hdjarv/se-notd-dl.git
cd se-notd-dl
npm install
```

## Usage

Use this utility by invoking it like this:

```
./se-notd-dl.js
```

The name of the day list is saved in the `notd.json` file. It is overwritten if it exists.

## Disclaimer

I am in no way affiliated with the Svenska Akademien. If this utility is in violation with their web site's terms of use, 
contact me and I will remove it.

## Credits

This utility was created by Henrik Djärv.

## License

MIT, see file [LICENSE](https://github.com/hdjarv/se-notd-dl/blob/master/LICENSE)
