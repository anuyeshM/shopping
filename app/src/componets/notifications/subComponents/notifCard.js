import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import '../notifications.css';

import ArrowDown from '../../../assets/images/arrowBigDown.svg';

const useStyles = makeStyles(
  (theme) => ({
    expand: {
      height: '100%',
      width: '100%',
      display: 'flex',
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
  }),
  { index: 1 }
);

const NotifCard = ({ card, cardData, setCardData }) => {
  const classes = useStyles();
  const [expand, setExpand] = useState(false);

  function handleExpand(id) {
    setExpand(!expand);

    let localCardData = cardData;

    localCardData.forEach((card) => {
      if (card.id === id) {
        if (!card.read) card.read = true;
      }
    });

    setCardData(localCardData);
  }

  return (
    <Card
      className='card-wrapper shadow-apply'
      style={{ height: expand ? '' : '9rem' }}>
      <div
        className='left-section'
        style={{
          backgroundColor: card.read ? '#fff' : '#47b896',
        }}></div>
      <div className='right-section'>
        <div className='card-header'>
          <div className='card-header-left'>
            <div className='icon-container'></div>
            <div className='name-container'>{card.name}</div>
          </div>
          <div className='button-wrapper'>
            <div
              className={clsx(classes.expand, {
                [classes.expandOpen]: expand,
              })}
              onClick={() => handleExpand(card.id)}
              aria-expanded={expand}
              aria-label='show more'>
              <img src={ArrowDown} />
            </div>
          </div>
        </div>
        <div className={expand ? 'card-body-expand' : 'card-body'}>
          <span style={{ width: '90%', textTransform: 'none' }}>
            {card.body}
          </span>
          <span className='card-body-dots'>{!expand ? '...' : null}</span>
        </div>
        <div className='card-footer'>
          <div className='card-footer-dateTime'>{card.dateandtime}</div>
          {card.details ? (
            <div className='card-footer-button'>Details</div>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

export default NotifCard;
