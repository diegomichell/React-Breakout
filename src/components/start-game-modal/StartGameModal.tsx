import React, {useState} from 'react';
import {Button, Form, Modal} from 'react-bootstrap';

interface StartGameModalProps {
  show: boolean,
  handleClose: Function,
  onStart: (username: string) => void
}

export const StartGameModal = ({show, handleClose, onStart}: StartGameModalProps) => {
  const [validated, setValidated] = useState(false);
  let formRef: any = null;

  const handleSubmit = (event?: any) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (formRef.checkValidity()) {
      const username = formRef.elements['username'].value;

      onStart(username);
      handleClose();
    }

    setValidated(true);
  };


  return (
    <Modal centered className='StartGameModal' show={show} onHide={() => handleClose()}>
      <Modal.Body>
        <Form ref={(ref: any) => {
          formRef = ref
        }} noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group controlId='formUsername'>
            <Form.Control
              className="text-center"
              required
              name='username' type='text'
              placeholder='What is your name?'
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button block variant='primary' onClick={() => {
          handleSubmit();
        }}>
          Start Game
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StartGameModal;