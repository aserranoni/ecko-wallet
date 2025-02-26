import './App.scss';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import { ToastContainer } from 'react-toastify';
import store from './stores';
import 'react-toastify/dist/ReactToastify.css';
import AppContainer from './AppContainer';
import { ModalProvider, ModalConsumer } from './contexts/ModalContext';
import { CrossChainProvider } from './contexts/CrossChainContext';
import { AppThemeProvider } from './contexts/AppThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AccountBalanceProvider } from './contexts/AccountBalanceContext';
import ModalCustom from './components/Modal/ModalCustom';

const AppWrapper = styled.div`
  display: block;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  height: 100%;
  @media screen and (max-width: 1024px) {
    background: none;
  }
`;
const Content = styled.div`
  width: 100%;
  margin: 0 auto;
  border: none;
  display: flex;
  justify-content: center;
  flex: 1 0 auto;
`;
const ToastWrapper = styled.div`
  .Toastify__toast-theme--light.Toastify__toast--success {
    background: ${({ theme }) => theme.iconBackground};
    border-left: 4px solid #25d366;
    border-radius: 4px;
    width: 90%;
    margin: 10px auto;
  }
  .Toastify__toast-theme--light.Toastify__toast--error {
    background: ${({ theme }) => theme.iconBackground};
    border-left: 4px solid #e74c3c;
    border-radius: 4px;
    width: 90%;
    margin: 10px auto;
  }
  .Toastify__toast-container {
    margin-top: 90px;
  }
`;

const App = () => (
  <Provider store={store}>
    <AppThemeProvider>
      <AppWrapper>
        <Content>
          <ModalProvider>
            <ModalConsumer>
              {({ isOpen, title, content, footer, closeModal, roundIcon }) => (
                <ModalCustom isOpen={isOpen || false} title={title} footer={footer} onCloseModal={closeModal} roundIcon={roundIcon}>
                  {content}
                </ModalCustom>
              )}
            </ModalConsumer>
            <SettingsProvider>
              <AccountBalanceProvider>
                <CrossChainProvider>
                  <AppContainer />
                </CrossChainProvider>
              </AccountBalanceProvider>
            </SettingsProvider>
          </ModalProvider>
        </Content>
      </AppWrapper>
      <ToastWrapper>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          icon={false}
          closeButton={false}
          pauseOnFocusLoss
          draggable
          theme="light"
          pauseOnHover
        />
      </ToastWrapper>
    </AppThemeProvider>
  </Provider>
);

export default App;
