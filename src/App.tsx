import styled from 'styled-components'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import UserData from './windows/userData/UserData'
import UserSettings from './windows/userSettings/UserSettings'
import UserInput from './windows/userInput/UserInput'
import { AppContextProvider } from './context/AppContext'
import UserAuth from './windows/userAuth/UserAuth'
import UserLoading from './windows/userLoading/UserLoading'

const MainContainer = styled.main`
  background-color: var(--bg-color);
  width: 100vw;
  height: 100vh;
  border-top-right-radius: 0.3em;
  border-top-left-radius: 0.3em;
`

function App() {
  return (
    <MainContainer>
      <AppContextProvider>
        <Router>
          <Routes>
            <Route path='/' element={<UserData />} />
            <Route path='/settings' element={<UserSettings />} />
            <Route path='/input' element={<UserInput />} />
            <Route path='/auth' element={<UserAuth />} />
            <Route path='/loading' element={<UserLoading />} />
          </Routes>
        </Router>
      </AppContextProvider>
    </MainContainer>
  )
}

export default App
