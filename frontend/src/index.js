import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, SignIn } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Profile from './components/Profile';
import Navbar from './components/navbar';
import MyPosts from './components/Myposts';
import MyChats from './components/MyChats';
// Placeholder pages (you'll create these shortly)
function Chats() {
  return <div style={{ padding: 20 }}>Chats Page - coming soon...</div>;
}
const clerkPubKey = 'pk_test_cmVzdGVkLW95c3Rlci04MS5jbGVyay5hY2NvdW50cy5kZXYk';

const Root = () => (
  <ClerkProvider publishableKey={clerkPubKey}>
    <BrowserRouter>
      <SignedIn>
          <Navbar />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/chats" element={<MyChats />} />
            <Route path="/my-posts" element={<MyPosts />}/>
            <Route path="/profile" element={<Profile />} />
          </Routes>
      </SignedIn>
      <SignedOut>
        <Routes>
          <Route path="sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
          <Route path="*" element={<RedirectToSignIn />} />
        </Routes>
      </SignedOut>
    </BrowserRouter>
  </ClerkProvider>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
