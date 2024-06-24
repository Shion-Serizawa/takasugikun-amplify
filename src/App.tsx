import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import ImageUpload from './components/ImageUpload';
import InvokeLambda from './components/InvokeLamda';
import InvokeBedrock from './components/InvokeBedrock';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Welcome {user?.signInDetails?.loginId}</h1>
          <button onClick={signOut}>Sign out</button>
          <ImageUpload />
          <InvokeLambda />
          <InvokeBedrock />
        </main>
      )}
    </Authenticator>
  );
}

export default App;
