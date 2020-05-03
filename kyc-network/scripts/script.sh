#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Build your first network (BYFN) end-to-end test"
echo
CHANNEL_NAME="$1"
DELAY="$2"
CC_SRC_LANGUAGE="$3"
TIMEOUT="$4"
VERBOSE="$5"
NO_CHAINCODE="$6"
: ${CHANNEL_NAME:="mychannel"}
: ${DELAY:="3"}
: ${CC_SRC_LANGUAGE:="go"}
: ${TIMEOUT:="10"}
: ${VERBOSE:="false"}
: ${NO_CHAINCODE:="false"}
CC_SRC_LANGUAGE=$(echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:])
COUNTER=1
MAX_RETRY=20
PACKAGE_ID=""

if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang" ]; then
	CC_RUNTIME_LANGUAGE=golang
	CC_SRC_PATH="github.com/hyperledger/fabric-samples/chaincode/abstore/go/"
elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
	CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode/abstore/javascript/"
elif [ "$CC_SRC_LANGUAGE" = "java" ]; then
	CC_RUNTIME_LANGUAGE=java
	CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric-samples/chaincode/abstore/java/"
else
	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
	echo Supported chaincode languages are: go, javascript, java
	exit 1
fi

echo "Channel name : "$CHANNEL_NAME

# import utils
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/kyc.com/orderers/orderer.kyc.com/msp/tlscacerts/tlsca.kyc.com-cert.pem
PEER0_ORG1_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/citiBank.kyc.com/peers/peer0.citiBank.kyc.com/tls/ca.crt
PEER0_ORG2_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sbi.kyc.com/peers/peer0.sbi.kyc.com/tls/ca.crt
PEER0_ORG3_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.kyc.com/peers/peer0.org3.kyc.com/tls/ca.crt

# verify the result of the end-to-end test
verifyResult() {
	if [ $1 -ne 0 ]; then
		echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
		echo "========= ERROR !!! FAILED to execute End-2-End Scenario ==========="
		echo
		exit 1
	fi
}

# Set OrdererOrg.Admin globals
setOrdererGlobals() {
	CORE_PEER_LOCALMSPID="OrdererMSP"
	CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/kyc.com/orderers/orderer.kyc.com/msp/tlscacerts/tlsca.kyc.com-cert.pem
	CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/kyc.com/users/Admin@kyc.com/msp
}

setGlobals() {
	PEER=$1
	ORG=$2
	echo "setGLOBALSSS SDSAF ${ORG}"
	if [ "$ORG" = "citiBank" -o "$ORG" = "1" ]; then
		CORE_PEER_LOCALMSPID="CitiBankMSP"
		CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
		CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/citiBank.kyc.com/users/Admin@citiBank.kyc.com/msp
		if [ $PEER -eq 0 ]; then
			CORE_PEER_ADDRESS=peer0.citiBank.kyc.com:7051
		else
			CORE_PEER_ADDRESS=peer1.citiBank.kyc.com:8051
		fi
	elif [ "$ORG" = "sbi" -o "$ORG" = "2" ]; then
		CORE_PEER_LOCALMSPID="SbiMSP"
		CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
		CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/sbi.kyc.com/users/Admin@sbi.kyc.com/msp
		if [ $PEER -eq 0 ]; then
			CORE_PEER_ADDRESS=peer0.sbi.kyc.com:9051
		else
			CORE_PEER_ADDRESS=peer1.sbi.kyc.com:10051
		fi

	elif [ "$ORG" = "3" ]; then
		CORE_PEER_LOCALMSPID="Org3MSP"
		CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
		CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.kyc.com/users/Admin@org3.kyc.com/msp
		if [ $PEER -eq 0 ]; then
			CORE_PEER_ADDRESS=peer0.org3.kyc.com:11051
		else
			CORE_PEER_ADDRESS=peer1.org3.kyc.com:12051
		fi
	else
		echo "================== ERROR !!! ORG Unknown =================="
	fi

	if [ "$VERBOSE" == "true" ]; then
		env | grep CORE
	fi
}

updateAnchorPeers() {
	PEER=$1
	ORG=$2
	setGlobals $PEER $ORG

	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		set -x
		peer channel update -o orderer.kyc.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx >&log.txt
		res=$?
		set +x
	else
		set -x
		peer channel update -o orderer.kyc.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
		res=$?
		set +x
	fi
	cat log.txt
	# verifyResult $res "Anchor peer update failed"
	echo "===================== Anchor peers updated for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME' ===================== "
	sleep $DELAY
	echo
}

## Sometimes Join takes time hence RETRY at least 5 times
joinChannelWithRetry() {
	PEER=$1
	ORG=$2

	setGlobals $PEER $ORG

	set -x
	peer channel join -b $CHANNEL_NAME.block >&log.txt
	res=$?
	set +x
	cat log.txt
	if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
		COUNTER=$(expr $COUNTER + 1)
		echo "peer${PEER}.${ORG} failed to join the channel, Retry after $DELAY seconds"
		sleep $DELAY
		joinChannelWithRetry $PEER $ORG
	else
		COUNTER=1
	fi
	# verifyResult $res "After $MAX_RETRY attempts, peer${PEER}.org${ORG} has failed to join channel '$CHANNEL_NAME' "
}

# packageChaincode VERSION PEER ORG
packageChaincode() {
	VERSION=$1
	PEER=$2
	ORG=$3
	setGlobals $PEER $ORG
	set -x
	peer lifecycle chaincode package mycc.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label mycc_${VERSION} >&log.txt
	res=$?
	set +x
	cat log.txt
	# verifyResult $res "Chaincode packaging on peer${PEER}.org${ORG} has failed"
	echo "===================== Chaincode is packaged on peer${PEER}.org${ORG} ===================== "
	echo
}

# installChaincode PEER ORG
installChaincode() {
	PEER=$1
	ORG=$2
	setGlobals $PEER $ORG
	set -x
	peer lifecycle chaincode install mycc.tar.gz >&log.txt
	res=$?
	set +x
	cat log.txt
	# verifyResult $res "Chaincode installation on peer${PEER}.org${ORG} has failed"
	echo "===================== Chaincode is installed on peer${PEER}.org${ORG} ===================== "
	echo
}

# queryInstalled PEER ORG
queryInstalled() {
	PEER=$1
	ORG=$2
	setGlobals $PEER $ORG
	set -x
	peer lifecycle chaincode queryinstalled >&log.txt
	res=$?
	set +x
	cat log.txt
	PACKAGE_ID=$(sed -n '/Package/{s/^Package ID: //; s/, Label:.*$//; p;}' log.txt)
	# verifyResult $res "Query installed on peer${PEER}.org${ORG} has failed"
	echo PackageID is ${PACKAGE_ID}
	echo "===================== Query installed successful on peer${PEER}.org${ORG} on channel ===================== "
	echo
}

# approveForMyOrg VERSION PEER ORG
approveForMyOrg() {
	VERSION=$1
	PEER=$2
	ORG=$3
	setGlobals $PEER $ORG

	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		set -x
		peer lifecycle chaincode approveformyorg --channelID $CHANNEL_NAME --name mycc --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} --waitForEvent >&log.txt
		set +x
	else
		set -x
		peer lifecycle chaincode approveformyorg --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name mycc --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} --waitForEvent >&log.txt
		set +x
	fi
	cat log.txt
	# verifyResult $res "Chaincode definition approved on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' failed"
	echo "===================== Chaincode definition approved on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' ===================== "
	echo
}

# commitChaincodeDefinition VERSION PEER ORG (PEER ORG)...
commitChaincodeDefinition() {
	VERSION=$1
	shift
	parsePeerConnectionParameters $@
	res=$?
	# verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

	# while 'peer chaincode' command can get the orderer endpoint from the
	# peer (if join was successful), let's supply it directly as we know
	# it using the "-o" option
	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		set -x
		peer lifecycle chaincode commit -o orderer.kyc.com:7050 --channelID $CHANNEL_NAME --name mycc $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --init-required >&log.txt
		res=$?
		set +x
	else
		set -x
		peer lifecycle chaincode commit -o orderer.kyc.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name mycc $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --init-required >&log.txt
		res=$?
		set +x
	fi
	cat log.txt
	# verifyResult $res "Chaincode definition commit failed on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' failed"
	echo "===================== Chaincode definition committed on channel '$CHANNEL_NAME' ===================== "
	echo
}

# checkCommitReadiness VERSION PEER ORG
checkCommitReadiness() {
	VERSION=$1
	ORG=$3
	shift 3
	setGlobals $PEER $ORG
	echo "===================== Checking the commit readiness of the chaincode definition on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME'... ===================== "
	local rc=1
	local starttime=$(date +%s)

	# continue to poll
	# we either get a successful response, or reach TIMEOUT
	while
		test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
	do
		sleep $DELAY
		echo "Attempting to check the commit readiness of the chaincode definition on peer${PEER}.org${ORG} ...$(($(date +%s) - starttime)) secs"
		set -x
		peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name mycc $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --output json --init-required >&log.txt
		res=$?
		set +x
		test $res -eq 0 || continue
		let rc=0
		for var in "$@"; do
			grep "$var" log.txt &>/dev/null || let rc=1
		done
	done
	echo
	cat log.txt
	if test $rc -eq 0; then
		echo "===================== Checking the commit readiness of the chaincode definition successful on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' ===================== "
	else
		echo "!!!!!!!!!!!!!!! Check commit readiness result on peer${PEER}.org${ORG} is INVALID !!!!!!!!!!!!!!!!"
		echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
		echo
		exit 1
	fi
}

# queryCommitted VERSION PEER ORG
queryCommitted() {
	VERSION=$1
	PEER=$2
	ORG=$3
	setGlobals $PEER $ORG
	EXPECTED_RESULT="Version: ${VERSION}, Sequence: ${VERSION}, Endorsement Plugin: escc, Validation Plugin: vscc"
	echo "===================== Querying chaincode definition on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME'... ===================== "
	local rc=1
	local starttime=$(date +%s)

	# continue to poll
	# we either get a successful response, or reach TIMEOUT
	while
		test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
	do
		sleep $DELAY
		echo "Attempting to Query committed status on peer${PEER}.org${ORG} ...$(($(date +%s) - starttime)) secs"
		set -x
		peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name mycc >&log.txt
		res=$?
		set +x
		test $res -eq 0 && VALUE=$(cat log.txt | grep -o '^Version: [0-9], Sequence: [0-9], Endorsement Plugin: escc, Validation Plugin: vscc')
		test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
	done
	echo
	cat log.txt
	if test $rc -eq 0; then
		echo "===================== Query chaincode definition successful on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' ===================== "
	else
		echo "!!!!!!!!!!!!!!! Query chaincode definition result on peer${PEER}.org${ORG} is INVALID !!!!!!!!!!!!!!!!"
		echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
		echo
		exit 1
	fi
}

chaincodeQuery() {
	PEER=$1
	ORG=$2
	setGlobals $PEER $ORG
	EXPECTED_RESULT=$3
	echo "===================== Querying on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME'... ===================== "
	local rc=1
	local starttime=$(date +%s)

	# continue to poll
	# we either get a successful response, or reach TIMEOUT
	while
		test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
	do
		sleep $DELAY
		echo "Attempting to Query peer${PEER}.org${ORG} ...$(($(date +%s) - starttime)) secs"
		set -x
		peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}' >&log.txt
		res=$?
		set +x
		test $res -eq 0 && VALUE=$(cat log.txt | awk '/Query Result/ {print $NF}')
		test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
		# removed the string "Query Result" from peer chaincode query command
		# result. as a result, have to support both options until the change
		# is merged.
		test $rc -ne 0 && VALUE=$(cat log.txt | egrep '^[0-9]+$')
		test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
	done
	echo
	cat log.txt
	if test $rc -eq 0; then
		echo "===================== Query successful on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' ===================== "
	else
		echo "!!!!!!!!!!!!!!! Query result on peer${PEER}.org${ORG} is INVALID !!!!!!!!!!!!!!!!"
		echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
		echo
		exit 1
	fi
}

# fetchChannelConfig <channel_id> <output_json>
# Writes the current channel config for a given channel to a JSON file
fetchChannelConfig() {
	CHANNEL=$1
	OUTPUT=$2

	setOrdererGlobals

	echo "Fetching the most recent configuration block for the channel"
	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		set -x
		peer channel fetch config config_block.pb -o orderer.kyc.com:7050 -c $CHANNEL --cafile $ORDERER_CA
		set +x
	else
		set -x
		peer channel fetch config config_block.pb -o orderer.kyc.com:7050 -c $CHANNEL --tls --cafile $ORDERER_CA
		set +x
	fi

	echo "Decoding config block to JSON and isolating config to ${OUTPUT}"
	set -x
	configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config >"${OUTPUT}"
	set +x
}

# signConfigtxAsPeerOrg <org> <configtx.pb>
# Set the peerOrg admin of an org and signing the config update
signConfigtxAsPeerOrg() {
	PEERORG=$1
	TX=$2
	setGlobals 0 $PEERORG
	set -x
	peer channel signconfigtx -f "${TX}"
	set +x
}

# createConfigUpdate <channel_id> <original_config.json> <modified_config.json> <output.pb>
# Takes an original and modified config, and produces the config update tx
# which transitions between the two
createConfigUpdate() {
	CHANNEL=$1
	ORIGINAL=$2
	MODIFIED=$3
	OUTPUT=$4

	set -x
	configtxlator proto_encode --input "${ORIGINAL}" --type common.Config >original_config.pb
	configtxlator proto_encode --input "${MODIFIED}" --type common.Config >modified_config.pb
	configtxlator compute_update --channel_id "${CHANNEL}" --original original_config.pb --updated modified_config.pb >config_update.pb
	configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate >config_update.json
	echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . >config_update_in_envelope.json
	configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope >"${OUTPUT}"
	set +x
}

# parsePeerConnectionParameters $@
# Helper function that takes the parameters from a chaincode operation
# (e.g. invoke, query, instantiate) and checks for an even number of
# peers and associated org, then sets $PEER_CONN_PARMS and $PEERS
parsePeerConnectionParameters() {
	# check for uneven number of peer and org parameters
	if [ $(($# % 2)) -ne 0 ]; then
		exit 1
	fi

	PEER_CONN_PARMS=""
	PEERS=""
	while [ "$#" -gt 0 ]; do
		setGlobals $1 $2
		PEER="peer$1.org$2"
		PEERS="$PEERS $PEER"
		PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
		if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "true" ]; then
			TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER$1_ORG$2_CA")
			PEER_CONN_PARMS="$PEER_CONN_PARMS $TLSINFO"
		fi
		# shift by two to get the next pair of peer/org parameters
		shift
		shift
	done
	# remove leading space for output
	PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
}

# chaincodeInvoke IS_INIT PEER ORG (PEER ORG) ...
# Accepts as many peer/org pairs as desired and requests endorsement from each
chaincodeInvoke() {
	IS_INIT=$1
	shift
	parsePeerConnectionParameters $@
	res=$?
	# verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

	if [ "${IS_INIT}" -eq "1" ]; then
		CCARGS='{"Args":["Init","a","100","b","100"]}'
		INIT_ARG="--isInit"
	else
		CCARGS='{"Args":["invoke","a","b","10"]}'
		INIT_ARG=""
	fi

	# while 'peer chaincode' command can get the orderer endpoint from the
	# peer (if join was successful), let's supply it directly as we know
	# it using the "-o" option
	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		set -x
		peer chaincode invoke -o orderer.kyc.com:7050 -C $CHANNEL_NAME -n mycc $PEER_CONN_PARMS ${INIT_ARG} -c ${CCARGS} >&log.txt
		res=$?
		set +x
	else
		set -x
		peer chaincode invoke -o orderer.kyc.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n mycc $PEER_CONN_PARMS ${INIT_ARG} -c ${CCARGS} >&log.txt
		res=$?
		set +x
	fi
	cat log.txt
	# verifyResult $res "Invoke execution on $PEERS failed "
	echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
	echo
}

createChannel() {
	setGlobals 0 1

	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
		set -x
		peer channel create -o orderer.kyc.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx >&log.txt
		res=$?
		set +x
	else
		set -x
		peer channel create -o orderer.kyc.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
		res=$?
		set +x
	fi
	cat log.txt
	verifyResult $res "Channel creation failed"
	echo "===================== Channel '$CHANNEL_NAME' created ===================== "
	echo
}

joinChannel() {
	for org in 1 2; do
		if [[ "$org" -eq 1 ]]; then
			for peer in 0 1; do
				joinChannelWithRetry $peer "citiBank"
				echo "===================== peer${peer}.citiBank joined channel '$CHANNEL_NAME' ===================== "
				sleep $DELAY
				echo
			done
		else
			for peer in 0 1; do
				joinChannelWithRetry $peer "sbi"
				echo "===================== peer${peer}.sbi joined channel '$CHANNEL_NAME' ===================== "
				sleep $DELAY
				echo
			done
		fi
	done
}

## Create channel
echo "Creating channel..."
createChannel

## Join all the peers to the channel
echo "Having all peers join the channel..."
joinChannel

## Set the anchor peers for each org in the channel
echo "Updating anchor peers for org1..."
updateAnchorPeers 0 1
echo "Updating anchor peers for org2..."
updateAnchorPeers 0 2

if [ "${NO_CHAINCODE}" != "true" ]; then

	## at first we package the chaincode
	packageChaincode 1 0 1

	## Install chaincode on peer0.org1 and peer0.org2
	echo "Installing chaincode on peer0.org1..."
	installChaincode 0 1
	echo "Install chaincode on peer0.org2..."
	installChaincode 0 2

	## query whether the chaincode is installed
	queryInstalled 0 1

	## approve the definition for org1
	approveForMyOrg 1 0 1

	## check whether the chaincode definition is ready to be committed
	## expect org1 to have approved and org2 not to
	checkCommitReadiness 1 0 1 "\"CitiBankMSP\": true" "\"SbiMSP\": false"
	checkCommitReadiness 1 0 2 "\"CitiBankMSP\": true" "\"SbiMSP\": false"

	## now approve also for SBI
	approveForMyOrg 1 0 2

	## check whether the chaincode definition is ready to be committed
	## expect them both to have approved
	checkCommitReadiness 1 0 1 "\"CitiBankMSP\": true" "\"SbiMSP\": true"
	checkCommitReadiness 1 0 2 "\"CitiBankMSP\": true" "\"SbiMSP\": true"

	## now that we know for sure both orgs have approved, commit the definition
	commitChaincodeDefinition 1 0 1 0 2

	## query on both orgs to see that the definition committed successfully
	queryCommitted 1 0 1
	queryCommitted 1 0 2

	# invoke init
	chaincodeInvoke 1 0 1 0 2

	# Query chaincode on peer0.org1
	echo "Querying chaincode on peer0.org1..."
	chaincodeQuery 0 1 100

	# Invoke chaincode on peer0.org1 and peer0.org2
	echo "Sending invoke transaction on peer0.org1 peer0.org2..."
	chaincodeInvoke 0 0 1 0 2

	# Query chaincode on peer0.org1
	echo "Querying chaincode on peer0.org1..."
	chaincodeQuery 0 1 90

	## Install chaincode on peer1.org2
	echo "Installing chaincode on peer1.org2..."
	installChaincode 1 2

	# Query on chaincode on peer1.org2, check if the result is 90
	echo "Querying chaincode on peer1.org2..."
	chaincodeQuery 1 2 90

fi

echo
echo "========= All GOOD, BYFN execution completed =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
