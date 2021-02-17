# no-day

After midnight of every day. Technically it's the next day, but doesn't the next day really start when you wake up in the morning?

## Early prototype

This repo contains a very early prototype of the no-day graph editor.

## Run the UI on the current repo

```
git clone https://github.com/no-day/no-day
cd no-day
yarn install
yarn no-day
```

The UI is served on port 9000.

## Run the UI on another local repo

Currently we don't provide an installer, but you can:

```
ln -fs $PWD/node_modules/.bin/no-day ~/bin/no-day
```

And from another monorepo then run:`no-day` at the root.
