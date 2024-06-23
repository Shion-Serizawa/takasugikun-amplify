import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import ImageUpload from './components/ImageUpload';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Welcome {user?.signInDetails?.loginId}</h1>
          <button onClick={signOut}>Sign out</button>
          <ImageUpload />
        </main>
      )}
    </Authenticator>
  );
}

export default App;
