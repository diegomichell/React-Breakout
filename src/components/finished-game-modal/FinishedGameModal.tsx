import React, {useState} from 'react';
import {Button, Form, Modal} from 'react-bootstrap';

interface FinishedGameModalProps {
  show: boolean,
  handleClose: Function,
  onPlayAgain: () => void,
  didWin: boolean
}

export const FinishedGameModal = ({show, handleClose, onPlayAgain, didWin}: FinishedGameModalProps) => {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event?: any) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    onPlayAgain();
    handleClose();

    setValidated(true);
  };

  return (
    <Modal centered className='FinishedGameModal' show={show} onHide={() => handleClose()}>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <h3
            className={`${didWin ? 'won-message' : 'lost-message'} text-center`}>{didWin ? 'Congrats, you won!' : 'Sorry, you lost'}</h3>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button block variant='success' onClick={() => {
          handleSubmit();
        }}>
          Play Again
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FinishedGameModal;