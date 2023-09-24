import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import io from 'socket.io-client';
import feathers from '@feathersjs/client';

const socket = io('http://localhost:3030');
const app = feathers();

app.configure(feathers.socketio(socket));

function Ideas() {
  const [ideas, setIdeas] = useState([]);
  const [ideaText, setIdeaText] = useState('');
  const [ideaTech, setIdeaTech] = useState('');
  const [ideaViewer, setIdeaViewer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchIdeas = async () => {
      setIsLoading(true);
      try {
        const response = await app.service('ideas').find();
        setIdeas(response.data);
      } catch (error) {
        console.error('Error fetching ideas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();

    const ideaService = app.service('ideas');
    ideaService.on('created', (idea) => {
      setIdeas((prevIdeas) => [...prevIdeas, idea]);
    });

    return () => {
      ideaService.removeAllListeners('created');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ideaText.trim() === '' || ideaTech.trim() === '' || ideaViewer.trim() === '') {
      return;
    }

    try {
      await app.service('ideas').create({
        text: ideaText,
        tech: ideaTech,
        viewer: ideaViewer,
      });

      setIdeaText('');
      setIdeaTech('');
      setIdeaViewer('');
    } catch (error) {
      console.error('Error submitting idea:', error);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6}>
          <h1 className="text-center mb-3">Submit an Idea</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Control
                type="text"
                id="idea-text"
                placeholder="Enter idea (30 chars max)"
                maxLength="30"
                required
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                type="text"
                id="idea-tech"
                placeholder="Language, framework, etc"
                maxLength="30"
                required
                value={ideaTech}
                onChange={(e) => setIdeaTech(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                type="text"
                id="idea-viewer"
                placeholder="Enter your name"
                maxLength="20"
                required
                value={ideaViewer}
                onChange={(e) => setIdeaViewer(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary" block disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Suggest Idea'}
            </Button>
          </Form>
        </Col>
        <Col md={6}>
          <div id="ideas">
            {ideas.map((idea) => (
              <Card key={idea._id} className="bg-secondary my-3">
                <Card.Body>
                  <p className="lead">
                    {idea.text} <strong>({idea.tech})</strong>
                    <br />
                    <em>Submitted by {idea.viewer}</em>
                    <br />
                    <small>{idea.createdAt}</small>
                  </p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Ideas;
