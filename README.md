# Sheller-Virtualbox
*Note: this is the Virtualbox version of Sheller. [Go here for the old LXC-based Sheller](https://github.com/memework/Sheller)*
A small testing bot designed to run like B1nzy's "Root Me"

Requirements:
  * [Node.JS](https://nodejs.org)
  * [Virtualbox](https://virtualbox.org)
  * [A Discord bot token](https://discordapp.com/developers/applications/me)


Setup:
  1. Clone the repo: `git clone git@github:memework/Sheller-Virtualbox`
  2. Install the node modules: `npm i`
  3. Create a VM in VirtualBox
  4. Stop the VM **IMPORTANT**
  5. Copy `secrets_example.json` to `secrets.json`
  6. Add your Discord bot token to `secrets.json`
  7. Add the username and password you use to login to your computer to `secrets.json`
  8. Add the VM name to `secrets.json`
  9. Run the bot: `node index.js`
