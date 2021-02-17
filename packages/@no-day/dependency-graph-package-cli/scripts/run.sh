#! /usr/bin/env bash
    
LOCAL_DIR=`dirname $(readlink -f ${BASH_SOURCE[0]})`/../../../..
DIR=$PWD

cd $LOCAL_DIR

GATSBY_BACKEND=http://localhost:4000 GATSBY_ROOT_DIR=$DIR yarn workspace @no-day/dependency-graph-package-client run build
	
echo "We'll get rid of this build process on startup soon."
	
DIR=$DIR PORT=4000 yarn workspace @no-day/dependency-graph-package-server run start & \
yarn workspace @no-day/dependency-graph-package-client run serve && \
fg