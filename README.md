##Setup

If you're running Debian/Ubuntu, run the following two lines:
```
sudo apt-get install build-essential libavahi-compat-libdnssd-dev
curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
```

```
git clone --recursive https://github.com/Hackworth/VeraHomeKitBridge.git
cd VeraHomeKitBridge
npm install
cd lib/HAP-NodeJS
npm install
cd -
```

Edit `config.json` entering your Vera's IP address

`npm run start`

##Assumptions

VeraHomeKitBridge will treat Vera pairs of scenes as binary switches.
For example, if you have two scenes named *Media Center - On* and
*Media Center - Off*, it will expose that to HomeKit as *Media Center*
and inteligently run the correct scene if you asked it to turn on or
off.

##Upgrading

Periodic updates of HAP-NodeJS are required for new versions of iOS,
here are complete instructions for upgrading.

```
git pull
git submodule foreach git pull
rm -rf persist
```
On your primary iOS device, Settings -> Privacy -> HomeKit -> Reset
HomeKit Configuration...

Re-add all your HomeKit devices

##Credits
Most of this is just [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS)
and the rest was made by user Albeebe on the Vera forums. I just made it
suck slightly less.
