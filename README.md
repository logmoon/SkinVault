# SkinVault
A simple CS2 inventory item prices tracker that helps you track your CS2 item investments and monitor their performance over time.

Price data is sourced from the Steam Market, we also account for the Steam tax.

All data is stored locally in the browser and can be exported and imported.

Currently only runs locally because I'm using the vite dev server proxy thingy to access the steam marketplace api.

# A little history
I recently got back into playing Counter Strike again, I found some old cases I got back when I was playing CSGO, I traded them for a few skins, and ever since then, I've been getting into the skins marketplaces, and trading, and trying to make a profit on my purchaces. So I built this to help me track my purchaces.
There are a lot of websites and tools that do this way better ([Pricempire](https://app.pricempire.com/) for example), but this one is mine, and I can tweak it to fit my wants and needs exactly.

# Usage
As stated above, this is only meant to run locally, so clone the repo, `cd` into it, `npm install`, and `npm run dev`. Can't get easier than that.

# Credits (aka the goats)
- [steam-item-name-ids by somespecialone](https://github.com/somespecialone/steam-item-name-ids)
- [CSGO-API by ByMykel](https://github.com/ByMykel/CSGO-API)
- [This post helped me approximate steam's seller cut](https://steamcommunity.com/sharedfiles/filedetails/?id=824580865)

Thank you for helping me figure this out!