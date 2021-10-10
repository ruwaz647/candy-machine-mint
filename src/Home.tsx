import { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import ASRCLogo from "./assets/Logo_gif.gif";

import * as anchor from "@project-serum/anchor";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
} from "./candy-machine";

const ConnectButton = styled(WalletDialogButton)`
  padding: 16px 32px!important;
  border-radius: 5px!important;
  background-color: rgba(106, 53, 53, 0.80)!important;
  color: #FFFFFF!important;
  font-weight: bold!important;
  font-size: 40px!important;
  font-family: Helvetica Neue!important;
  outline: black!important;
  border: none!important;
  transition: all 220ms ease-in-out!important;
  cursor: pointer!important;
  margin-bottom: 1em!important;


&:hover {
  background-color: rgba(106, 53, 53, 0.88)!important;
  border: none!important;
  color: #FFFFFF!important;
}
`;

const ServiceImg = styled.img`
  width: 24em;
  height: 24em;
  margin: 5px;
  align-items: center!important;

  @media screen and (max-width: 480px) {
  width: 12em;
  height: 16em;
}
`;

const CounterText = styled.span`
color: #FFFFFF!important;
font-weight: normal!important;
font-size: 40px!important;
font-family: Helvetica Neue!important;
`; // add your styles here

const MintContainer = styled.div`
  padding: 0;
  position=relative;
  display: flex;
  flex-direction: column;
  align-items: center;

`; // add your styles here

const PriceContainer = styled.div`
  position=relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #FFFFFF!important;
  font-weight: bold!important;
  outline: black!important;
  font-size: 38px!important;
  font-family: Helvetica Neue!important;
`;

const ImgContainer = styled.div`
  position=relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;


const MintButton = styled(Button)`
  padding: 12px 32px!important;
  border-radius: 5px!important;
  background-color: rgba(106, 53, 53, 0.50)!important;
  color: #FFFFFF!important;
  font-weight: normal!important;
  font-size: 50px!important;
  font-family: Helvetica Neue!important;
  outline: none!important;
  border: 2px solid;
  transition: all 220ms ease-in-out!important;
  cursor: pointer!important;
  margin-bottom: 1em!important;


  &:hover {
  background-color: rgba(106, 53, 53, 0.88)!important;
  border: none!important;
  color: #FFFFFF!important;
}
`; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(1633118400000));

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {

      }
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {

      }
    })();
  }, [wallet, props.connection]);

  useEffect(() => {
    (async () => {
      if (!wallet) return;

      const { candyMachine, goLiveDate, itemsRemaining } =
        await getCandyMachineState(
          wallet as anchor.Wallet,
          props.candyMachineId,
          props.connection
        );

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  }, [wallet, props.candyMachineId, props.connection]);

  return (
    <main>
    <ImgContainer>
      <ServiceImg src={ASRCLogo} />
    </ImgContainer>
    
      <PriceContainer>
        <p>Mint Price: 0.75 SOL </p>
      </PriceContainer>

      <MintContainer>

        {!wallet ? (
          <ConnectButton>Connect Wallet</ConnectButton>
        ) : (
          <MintButton
            disabled={isSoldOut || isMinting || !isActive}
            onClick={onMint}
            variant="contained"
          >
            {isSoldOut ? (
              "SOLD OUT"
            ) : isActive ? (
              isMinting ? (
                <CircularProgress />
              ) : (
                "MINT"
              )
            ) : (
              <Countdown
                date={startDate}
                onMount={({ completed }) => completed && setIsActive(true)}
                onComplete={() => setIsActive(true)}
                renderer={renderCounter}
              />
            )}
          </MintButton>
        )}
      </MintContainer>

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </main>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;
