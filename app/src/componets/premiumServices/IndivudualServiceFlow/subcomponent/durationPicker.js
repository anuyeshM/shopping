import React, { useState, useEffect, useMemo, useRef } from 'react';

import config from '../../../../commons/config';
import UseOutsideClick from '../../../../commons/useOutsideClick';
import ArrowDown from '../../../../assets/images/arrowBigDown.svg';

export default function DurationPicker(props) {
    const daysList = useMemo(() => config.days, []);
    const daysRef = useRef();
    const hoursList = useMemo(() => config.hours, []);
    const hoursRef = useRef();
    const minutesList = useMemo(() => config.minutes, []);
    const minutesRef = useRef();

    const [showDaysDropwdown, setShowDaysDropwdown] = useState(false);
    const [selectedDay, setSelectedDay] = useState(
        daysList ? daysList[0] : null
    );
    const [showHoursDropwdown, setShowHoursDropwdown] = useState(false);
    const [selectedHour, setSelectedHour] = useState(
        hoursList ? hoursList[0] : null
    );
    const [showMinutesDropwdown, setShowMinutesDropwdown] = useState(false);
    const [selectedMinute, setSelectedMinute] = useState(
        minutesList ? minutesList[0] : null
    );

    UseOutsideClick(daysRef, () => {
        setShowDaysDropwdown(false);
    });

    UseOutsideClick(hoursRef, () => {
        setShowHoursDropwdown(false);
    });

    UseOutsideClick(minutesRef, () => {
        setShowMinutesDropwdown(false);
    });

    return (
        <div className='duration-picker-container'>
            <p className='time-picker-label'>{props.title}</p>
            <div className='duration-picker-wrapper'>
            <div className='days-container'>
                <p className='duration-picker-text'>Days</p>
                <div
                    className='flight-dropdown-wrapper'
                    onClick={() => setShowDaysDropwdown(!showDaysDropwdown)}
                    ref={daysRef}
                >
                    {selectedDay}
                    <img
                        src={ArrowDown}
                        height='15'
                        width='15'
                        className='arrow-down-flight-dropdown'
                    />
                    {showDaysDropwdown ? (
                    <div className='flight-dropdown'>
                        {daysList.map((item) => (
                        <div
                            className='flight-tile'
                            key={item}
                            onClick={() => {
                                setSelectedDay(item);
                                props.daySetter(item);
                            }}
                        >
                            {item}
                        </div>
                        ))}
                    </div>
                    ) : null}
                </div>
            </div>

            <div className='days-container'>
                <p className='duration-picker-text'>Hours</p>
                <div
                    className='flight-dropdown-wrapper'
                    onClick={() => setShowHoursDropwdown(!showHoursDropwdown)}
                    ref={hoursRef}
                >
                    {selectedHour}
                    <img
                        src={ArrowDown}
                        height='15'
                        width='15'
                        className='arrow-down-flight-dropdown'
                    />
                    {showHoursDropwdown ? (
                    <div className='flight-dropdown'>
                        {hoursList.map((item) => (
                        <div
                            className='flight-tile'
                            key={item}
                            onClick={() => {
                                setSelectedHour(item);
                                props.hourSetter(item);
                            }}
                        >
                            {item}
                        </div>
                        ))}
                    </div>
                    ) : null}
                </div>
            </div>
            </div>

            <div className='minutes-container'>
                <p className='duration-picker-text'>Minutes</p>
                <div
                    className='flight-dropdown-wrapper'
                    onClick={() => setShowMinutesDropwdown(!showMinutesDropwdown)}
                    ref={minutesRef}
                >
                    {selectedMinute}
                    <img
                        src={ArrowDown}
                        height='15'
                        width='15'
                        className='arrow-down-flight-dropdown'
                    />
                    {showMinutesDropwdown ? (
                    <div className='flight-dropdown'>
                        {minutesList.map((item) => (
                        <div
                            className='flight-tile'
                            key={item}
                            onClick={() => {
                                setSelectedMinute(item);
                                props.minuteSetter(item);
                            }}
                        >
                            {item}
                        </div>
                        ))}
                    </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}