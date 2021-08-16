import React, {
  createContext, useContext, useEffect, useState, useRef
 } from 'react';
 import { HighScore, AavegotchiObject } from 'types';
 import { useWeb3 } from "web3/context";
 import fb from 'firebase';

 const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASEURL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID,
 };

 interface IServerContext {
  highscores?: Array<HighScore>;
 }

 export const ServerContext = createContext<IServerContext>({});

 export const ServerProvider = ({
  children,
 }: {
  children: React.ReactNode;
 }) => {
  const {
    state: { usersAavegotchis },
  } = useWeb3();
  const [highscores, setHighscores] = useState<Array<HighScore>>();
  const [firebase, setFirebase] = useState<fb.app.App>();
  const [initiated, setInitiated] = useState(false);

  const sortByScore = (a: HighScore, b: HighScore) => b.score - a.score;

  const myHighscoresRef = useRef(highscores);

  const setMyHighscores = (data: Array<HighScore>) => {
    myHighscoresRef.current = data;
    setHighscores(data);
  };

  const converter = {
    toFirestore: (data: HighScore) => data,
    fromFirestore: (snap: fb.firestore.QueryDocumentSnapshot) =>
      snap.data() as HighScore,
  };

  const snapshotListener = (
    database: fb.firestore.Firestore,
    gotchis: Array<AavegotchiObject>
  ) => {
    return database
      .collection("test")
      .withConverter(converter)
      .where(
        "tokenId",
        "in",
        gotchis.map((gotchi) => gotchi.id)
      )
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const changedItem = change.doc.data();
          const newHighscores = myHighscoresRef.current
            ? [...myHighscoresRef.current]
            : [];
          const itemIndex = newHighscores.findIndex(
            (item) => item.tokenId === changedItem.tokenId
          );
          if (itemIndex >= 0) {
            newHighscores[itemIndex] = changedItem;
            setMyHighscores(newHighscores.sort(sortByScore));
          } else {
            setMyHighscores([...newHighscores, changedItem].sort(sortByScore));
          }
        });
      });
  };

  useEffect(() => {
    if (usersAavegotchis && usersAavegotchis.length > 0 && firebase && initiated) {
      const db = firebase.firestore();
      const gotchiSetArray = [];
      for (let i = 0; i < usersAavegotchis.length; i += 10) {
        gotchiSetArray.push(usersAavegotchis.slice(i, i + 10));
      }
      const listenerArray = gotchiSetArray.map((gotchiArray) =>
        snapshotListener(db, gotchiArray)
      );

      return () => {
        listenerArray.forEach((listener) => listener());
      };
    }
  }, [usersAavegotchis, firebase]);

  useEffect(() => {
    const getHighscores = async (_firebase: fb.app.App) => {
      const db = _firebase.firestore();
      const highscoreRef = db
        .collection("test")
        .withConverter(converter);
      const snapshot = await highscoreRef.get();

      const highscoreResults: Array<HighScore> = [];
      snapshot.forEach((doc) => highscoreResults.push(doc.data()));
      setMyHighscores(highscoreResults.sort(sortByScore));
      setInitiated(true);
    };

    if (!firebase) {
      const firebaseInit = fb.initializeApp(firebaseConfig);
      setFirebase(firebaseInit);
      getHighscores(firebaseInit);
    }
  }, [firebase]);

  return (
    <ServerContext.Provider
      value={{
        highscores,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
 };

 export const useServer = () => useContext(ServerContext);