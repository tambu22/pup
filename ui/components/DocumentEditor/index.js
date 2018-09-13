/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, DropdownButton, MenuItem } from 'react-bootstrap';
import { Mutation } from 'react-apollo';
import autoBind from 'react-autobind';
import { Link } from 'react-router-dom';
import { Bert } from 'meteor/themeteorchef:bert';
import Icon from '../../components/Icon';
import { documents } from '../../queries/Documents.gql';
import { updateDocument } from '../../mutations/Documents.gql';
import delay from '../../../modules/delay';
import { timeago } from '../../../modules/dates';
import handleUpdateApolloCache from '../../../modules/handleUpdateApolloCache';

import {
  StyledDocumentEditor,
  DocumentEditorHeader,
  DocumentEditorTitle,
  DocumentEditorBody,
  DocumentEditorFooter,
} from './styles';

class DocumentEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { saving: false };
    autoBind(this);
  }

  handleUpdateDocument(mutate) {
    this.setState({ saving: true }, () => {
      delay(() => {
        mutate({
          variables: {
            _id: this.props.doc._id,
            title: this.form.title.value.trim(),
            body: this.form.body.value.trim(),
          },
        });
      }, 300);
    });
  }

  render() {
    const { doc, history } = this.props;
    return (
      <Mutation
        ignoreResults
        mutation={updateDocument}
        update={(cache) => {
          handleUpdateApolloCache(cache, { query: documents, field: 'documents' });
        }}
        onCompleted={() => {
          // NOTE: Delay set of this.state.saving to false so UI changes aren't jarring.
          setTimeout(() => this.setState({ saving: false }), 1000);
        }}
        onError={(error) => {
          Bert.alert(error.message, 'danger');
        }}
      >
        {(mutate) => (
          <React.Fragment>
            <DocumentEditorHeader className="clearfix">
              <p>
                {this.state.saving ? (
                  <em>Saving...</em>
                ) : (
                  <span>Last edit was {timeago(doc.updatedAt)}</span>
                )}
              </p>
              <DropdownButton
                bsStyle="default"
                title={
                  <span>
                    <Icon iconStyle="solid" icon="gear" />
                  </span>
                }
                id="set-document-public"
              >
                <MenuItem onClick={() => history.push(`/documents/${doc._id}`)}>
                  <Icon iconStyle="solid" icon="external-link-alt" /> View Document
                </MenuItem>
                <MenuItem divider />
                <MenuItem header>Visibility</MenuItem>
                <MenuItem
                  className={doc.isPublic && 'active'}
                  eventKey="1"
                  onClick={() => {
                    this.setState({ saving: true }, () => {
                      mutate({
                        variables: {
                          _id: doc._id,
                          isPublic: true,
                        },
                      });
                    });
                  }}
                >
                  <Icon iconStyle="solid" icon="unlock" /> Public
                </MenuItem>
                <MenuItem
                  className={!doc.isPublic && 'active'}
                  eventKey="2"
                  onClick={() => {
                    this.setState({ saving: true }, () => {
                      mutate({
                        variables: {
                          _id: doc._id,
                          isPublic: false,
                        },
                      });
                    });
                  }}
                >
                  <Icon iconStyle="solid" icon="lock" /> Private
                </MenuItem>
                <MenuItem divider />
                <MenuItem onClick={() => console.log('Delete')}>
                  <span className="text-danger">Delete Document</span>
                </MenuItem>
              </DropdownButton>
            </DocumentEditorHeader>
            <StyledDocumentEditor>
              <form ref={(form) => (this.form = form)} onSubmit={(event) => event.preventDefault()}>
                <DocumentEditorTitle>
                  <ControlLabel>Title</ControlLabel>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    defaultValue={doc && doc.title}
                    placeholder="Document Title"
                    onChange={() => this.handleUpdateDocument(mutate)}
                  />
                </DocumentEditorTitle>
                <DocumentEditorBody>
                  <ControlLabel>Body</ControlLabel>
                  <textarea
                    className="form-control"
                    name="body"
                    defaultValue={doc && doc.body}
                    placeholder="This is my document. There are many like it, but this one is mine."
                    onChange={() => this.handleUpdateDocument(mutate)}
                  />
                </DocumentEditorBody>
              </form>
            </StyledDocumentEditor>
            <DocumentEditorFooter className="clearfix">
              <span>
                <svg
                  width="63"
                  height="39"
                  viewBox="0 0 256 158"
                  preserveAspectRatio="xMinYMin meet"
                >
                  <path d="M238.371 157.892H18.395C8.431 157.892 0 149.462 0 139.497V18.395C0 8.431 8.431 0 18.395 0h219.21C247.569 0 256 8.431 256 18.395v121.102c0 9.964-7.665 18.395-17.629 18.395zM18.395 12.263c-3.066 0-6.132 3.066-6.132 6.132v121.102c0 3.832 3.066 6.132 6.132 6.132h219.21c3.832 0 6.132-3.066 6.132-6.132V18.395c0-3.832-3.066-6.132-6.132-6.132H18.395zM36.79 121.102V36.79h24.527l24.527 30.66 24.527-30.66h24.527v84.312h-24.527V72.814l-24.527 30.66-24.527-30.66v48.288H36.79zm154.06 0l-36.79-40.623h24.527V36.79h24.527v42.923h24.527l-36.79 41.389z" />
                </svg>
                <p>
                  <a href="https://www.markdownguide.org/basic-syntax" target="_blank">
                    Markdown Supported
                  </a>
                </p>
              </span>
            </DocumentEditorFooter>
          </React.Fragment>
        )}
      </Mutation>
    );
  }
}

DocumentEditor.defaultProps = {
  doc: null,
};

DocumentEditor.propTypes = {
  doc: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default DocumentEditor;
