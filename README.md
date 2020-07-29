# pihole-manager

Simple web interface for managing two Pi-hole instances

![piholemanager](https://raw.githubusercontent.com/tjeffree/pihole-manager/master/pihole-manager.png)

## Contents

### pihole grabber

The pihole grabber is a program to fetch data from the two Pi-hole instances and save it to `json` files. A systemctl service file is included too.

### web interface

The web interface needs putting behind a web server of some kind. An nginx docker container is probably the most convenient.

## Instructions

```
git clone https://github.com/tjeffree/pihole-manager.git
cd pihole-manager
```

### Set up `.env`

Copy the `example.env` to `.env` and update it with your two Pi-hole details.

```
cp example.env .env

nano .env
```

*There is no attention to security here, it's assumed your Pi-holes are on your internal network and not exposed to the world.*

### Python daemon setup

**Install dependancies**

`pip3 install -U python-dotenv`

**Test it**

`python3 ./piholegrabber.py`

Should see a bit of output showing the PIs that are being monitored. It'll wait for you to `ctrl+c` to quit.

**Set up service**

Modify `piholemanage.service` with the location of `piholegrabber.py` then:

```
sudo cp piholemanage.service /etc/systemd/system/
sudo chown root:root /etc/systemd/system/piholemanage.service
sudo chmod 644 /etc/systemd/system/piholemanage.service

sudo systemctl start piholemanage
```
Check it's running with:
```
sudo systemctl status piholemanage
```
You should also find a new `data` directory in the `pihole-manage` directory.

### Web interface setup

**Install docker**

Hit up [docker.io](https://docker.io)

**Start container**

```
docker run --name pihole-manage -v `pwd`:/usr/share/nginx/html -p 8080:80 -d nginx
```

Now you should be able to hit `http://[address-of-server]:8080

*I used `8080` in case you are running this on the same server as Pi-hole which already uses port `80` but change as you like*

