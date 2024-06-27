import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import InvokeLambda from './components/InvokeLamda';
import InvokeBedrock from './components/InvokeBedrock';
import InvokeMultiModal from './components/InvokeMultiModal';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>意識高すぎ、高杉くん</h1>
          <h2>Welcome {user?.signInDetails?.loginId}</h2>
          <button onClick={signOut}>Sign out</button>
      
          <InvokeLambda />
          <InvokeBedrock />
          <InvokeMultiModal />
        </main>
      )}
    </Authenticator>
  );
}

export default App;
