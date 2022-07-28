import React, { Fragment, useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import SmartFeedback from '../../smartFeedback/smartFeedback';

const Notification = (props) => {
  //feedback
  const history = useHistory();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [initialFeedback, setInitialFeedback] = useState(null);
  const [referenceId, setReferenceId] = useState(null);
  const [feedbackParams, setFeedbackParams] = useState(null);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isOverallOpen, setIsOverallOpen] = useState(false);

  const { notifData } = props;

  useEffect(() => {
    handleNotification();
  }, []);

  const handleNotification = () => {
    setInitialFeedback(notifData.metadata.notification.type.code);
    setReferenceId(notifData.data.referenceId);
    switch (notifData.metadata.notification.type.code) {
      case 'experience':
        setIsExperienceOpen(true);
        break;
      case 'overall':
        setIsOverallOpen(true);
        break;
      case 'item':
        setIsFeedbackOpen(true);
        setFeedbackParams(notifData.metadata.params);
        break;
    }
  };
  const handleFeedbackSubmit = () => {
    props.setIsFeedbackNotification(false);
    props.setNotifData(null);
    history.push('/homepage');
  };
  return (
    <Fragment>
      {isFeedbackOpen || isExperienceOpen || isOverallOpen ? (
        <SmartFeedback
          initialFeedback={initialFeedback}
          overlay={true}
          handleSubmit={handleFeedbackSubmit}
          isFeedbackOpen={isFeedbackOpen}
          setIsFeedbackOpen={setIsFeedbackOpen}
          isExperienceOpen={isExperienceOpen}
          setIsExperienceOpen={setIsExperienceOpen}
          isOverallOpen={isOverallOpen}
          setIsOverallOpen={setIsOverallOpen}
          referenceId={referenceId}
          feedbackParams={feedbackParams}
          orderId={feedbackParams && feedbackParams.orderId}
        />
      ) : null}
    </Fragment>
  );
};

export default Notification;
