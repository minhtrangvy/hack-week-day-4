# Hack Week Fall 2013 - Photoshare

## Pre-Installation
### Mac

Go to [this link](https://developer.apple.com/downloads/index.action) to
register as an Apple Developer and download the Command Line Tools for XCode,
taking care to download the correct version for your current operating system
version (i.e., Mavericks, Mountain Lion, etc.).

Press Command+Spacebar to open search, then search and open Terminal.

Now we will install [Homebrew](http://brew.sh) to manage the dependencies for
this project. Copy and paste the following command into the terminal, then press
enter.

    ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"

Then, run the following commands:

    brew install nodejs
    brew install mongodb


### Windows
We will be using [Chocolatey](http://chocolatey.org/) to manage the dependencies
for this project.

Type `Win+R` and enter `cmd` to open the command prompt. Copy the following
command, right click on the command prompt, paste the command, and press enter.

    @powershell -NoProfile -ExecutionPolicy unrestricted -Command "iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))" && SET PATH=%PATH%;%systemdrive%\chocolatey\bin

Now, type the following commands, pressing enter after each one:

    cinst nodejs.install
    cinst nodejs.commandline
    cinst gb.MongoDB

Close and reopen your command prompt.

### Linux (Ubuntu and Debian)

Open a terminal and enter the following command:

    sudo apt-get install nodejs mongodb

## Setting up the Application

First, navigate to a folder (such as the desktop) where you would like to store
the code.

Now, download the source code as a zip and extract it into that local folder.

Navigate to that folder in terminal.

###Windows

Navigate to the folder in the file browser, then Shift+Right Click and select
`Open command window here`.

###Mac

Open a terminal and type

    cd <name of path to folder>

That is, you will probably have a command like

    cd ~/Desktop/hack-week-day-4-master

If you saved and extracted the zip folder on the desktop.

## Install Node Dependencies and Setup Facebook Integration

Lastly, install the node dependencies by entering the following into your
terminal or command prompt.

    npm install

If would like to set up Facebook integration, you should navigate to the
[Facebook developers site](http://developers.facebook.com) and register as a
developer.
