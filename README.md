# pihole-manager

Simple web interface for managing two Pi-hole instances

![piholemanager](https://raw.githubusercontent.com/tjeffree/pihole-manager/master/pihole-manager.png)

## Contents

### pihole grabber

The pihole grabber is a program to fetch data from the two Pi-hole instances and save it to `json` files. A systemctl service file is included too.

### web interface

The web interface needs putting behind a web server of some kind. An nginx docker container is probably the most convenient.

### `.env`

Copy the `example.env` to `.env` and update it with your two Pi-hole details. There is no attention to security here, it's assumed your Pi-holes are on your internal network and not exposed to the world.
