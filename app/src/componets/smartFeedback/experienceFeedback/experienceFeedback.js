import React, { Fragment, useState } from 'react';
import './experienceFeedback.css';
import api from '../../../commons/api';
import config from '../../../commons/config';
import cross from '../../../assets/images/cross.svg';
import arrowLeft from '../../../assets/images/arrowLeft.svg';
import PrimaryButton from '../../../commons/components/atoms/primaryButton/primaryButton';
import CustomTextField from '../../../commons/components/molecules/customTextField/customTextField';
import CustomRating from '../../../commons/components/molecules/customRating/customRating';
import PushAlert from '../../../commons/notification';

const ExperienceFeedback = (props) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    api
      .post(config.api.feedback.experience.saveExperience, {
        rating,
        feedback: review,
        referenceId: props.referenceId ? props.referenceId : null,
      })
      .then((data) => {
        if (data.status === 201) {
          setSubmitted(true);
          props.setIsOpen(false);
          props.handleSubmit();
          PushAlert.success('Thank you for your valuable feedback!');
        }
      });
  };

  return (
    <div className='feedback-modal'>
      <div
        className={`${
          props.isOpen ? 'ef-modal ef-effect-3 ef-show' : 'ef-modal ef-effect-3'
        } ${props.overlay ? 'ef-modal-overlay' : ''}`}
        id='modal-3'>
        <div
          className={`ef-content ef-content-container  ${
            props.overlay ? 'ef-modal-content-overlay' : ''
          }`}>
          {props.overlay ? (
            <div
              className='ef-cross-container'
              onClick={() => props.setIsOpen(false)}>
              <img src={cross} alt='notfound' height={'20pt'} />
            </div>
          ) : (
            <div
              className='ef-close-line-container'
              draggable={true}
              onDrag={() => props.setIsOpen(false)}
              onClick={() => props.setIsOpen(false)}>
              <span className='ef-close-line'></span>
            </div>
          )}
          <div className='ef-header'>
            {!props.overlay && (
              <img
                src={arrowLeft}
                alt=''
                className='rate-backImage'
                onClick={() => props.setIsOpen(false)}
              />
            )}
            {/* <h5 className='bold rate-text'>Experience Feedback</h5> */}
          </div>
          <div className='scrollview'>
            {submitted ? (
              <h4>Thank you for your valuable feedback!</h4>
            ) : (
              <Fragment>
                <h4>How was your experience while using the application?</h4>
                <div className='rating-container'>
                  <CustomRating
                    setRating={setRating}
                    style={{ width: '85%', justifyContent: 'space-between' }}
                    rating={rating}
                  />
                </div>
                <CustomTextField
                  value={review}
                  setValue={setReview}
                  multiline={true}
                  placeholder='Write a review'
                  style={{ margin: '10pt 0pt', height: '80pt' }}
                />
                <div className='section-wrapper-additional'>
                  <h6
                    className='add-text'
                    onClick={() => {
                      props.setIsQuestionnaireOpen(true);
                      props.setQuestionnaireType('experience');
                    }}>
                    Give additional feedback
                  </h6>
                </div>
              </Fragment>
            )}
          </div>
          <PrimaryButton
            style={{
              marginBottom: '15pt',
              width: '80%',
              display: 'flex',
              alignSelf: 'center',
            }}
            onClick={handleSubmit}>
            Submit
          </PrimaryButton>
        </div>
      </div>
      <div className='ef-overlay'></div>
    </div>
  );
};

export default ExperienceFeedback;
