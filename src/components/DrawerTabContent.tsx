
import { ExternalLink } from 'lucide-react';
import { DateTime } from 'luxon';
import { getTimeSlotsString } from '../util/time';
import { DrawerContext } from '../contexts/DrawerContext';
import css from './DrawerTabContent.module.css';
import { useContext, useState } from 'react';


function DrawerTabContent() {
    const dayOffsetFromSunday = DateTime.now().weekday % 7; // literally will be refreshed every second because location status is. This is fine
    const daysStartingFromSunday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const drawerContext = useContext(DrawerContext);
    const loc = drawerContext.drawerLocation;

    const [showModal, setShowModal] = useState(false);
    const [userMessage, setUserMessage] = useState("");



    if (!loc) {
        return <div className={css.container} />;
    }

    const timeSlots = getTimeSlotsString(drawerContext.drawerLocation?.times ?? []);
    const specials = loc.todaysSpecials ?? [];
    const soups = loc.todaysSoups ?? [];
    const menu = loc.menu ?? '';

    function renderDescription() {
        return <div className={css.description}>{drawerContext.drawerLocation?.description}</div>;
    }

    function renderHours() {
        return (
            <>
                <h4 className={css['section-header']}>Hours</h4>

                <div className={css['hours-list']}>
                    {daysStartingFromSunday.map((_, index) => {
                        const realIndex = (index + dayOffsetFromSunday) % 7;
                        const label = daysStartingFromSunday[realIndex];
                        const isToday = realIndex === dayOffsetFromSunday;
                        return (
                            <div
                                key={label}
                                className={`${css['hours-row']} ${isToday ? css['hours-row-active'] : ''}`}
                            >
                                <span className={css['hours-day']}>{label}</span>
                                <span className={css['hours-times']}>{timeSlots[realIndex]}</span>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }

    function renderTodaysSpecials() {
        return (
            <>
                <h4 className={css['section-header']}>Today&apos;s Specials</h4>
                <div>
                    {specials.concat(soups).map((item) => (
                        <>
                            <div className={css['specials-item-title']}>{item.title}</div>
                            <div className={css['specials-item-dscrp']}>{item.description}</div>
                        </>
                    ))}
                </div>
            </>
        );
    }

    function renderMenu() {
        return (
            <>
                <h4 className={css['section-header']}>Menu</h4>
                <div>
                    {menu ? (
                        <a className={css['inline-link']} href={menu} target="_blank" rel="noreferrer">
                            <span>View menu online</span>
                            <ExternalLink size={14} aria-hidden />
                        </a>
                    ) : (
                        <div>
                            We are working on publishing an online menu for this location!
                            <br /> <br />
                            In the meantime, let us know what you think via{' '}
                            <a
                                className={css['inline-link']}
                                href="https://forms.gle/7JxgdgDhWMznQJdk9"
                                target="_blank"
                                rel="noreferrer"
                            >
                                our feedback form
                            </a>
                            .
                        </div>
                    )}
                </div>
            </>
        );
    }

    return (
        <div className={css.container}>
            {drawerContext.activeTab === 'overview' && (
                <>
                    {renderDescription()}
                    {renderHours()}
                    {(specials.length > 0 || soups.length > 0) && renderTodaysSpecials()}
                </>
            )}
            {drawerContext.activeTab === 'menu' && renderMenu()}
            {drawerContext.activeTab === 'reviews' && <p>reviews</p>}

            <div className={css['wrong-location-section']}>
                <h4 className={css['section-header']}>Wrong Location?</h4>
                <button
                    type="button"
                    className={css['wrong-location-button']}
                    onClick={() => setShowModal(true)}

                >
                    REPORT INCORRECT LOCATION
                </button>
            </div>


            {showModal && (
                <div className={css.locationEntryBackdrop}>
                    <div className={css.locationEntryBox}>
                        <h3 className={css.locationEntryTitle}> What's wrong with this location? (Optional — press submit to skip)</h3>

                
                        <textarea
                            className={css.locationEntryInput}
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            placeholder="Please describe the issue…"
                        />

                        <div className={css.locationEntryButtonRow}>
                            <button
                                className={css.locationEntryCancel}
                                onClick={() => {
                                    setShowModal(false);
                                    setUserMessage("");
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className={css.locationEntrySubmit}
                                onClick={async () => {
                                    const message =
                                        userMessage.trim().length > 0
                                            ? userMessage
                                            : `User reported incorrect location for ${loc.name}`;

                                    try {
                                        const response = await fetch(
                                            "http://localhost:5010/api/report-location",
                                            {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    locationId: loc.conceptId,
                                                    message,
                                                }),
                                            }
                                        );

                                        const data = await response.json();

                                        setShowModal(false);
                                        setUserMessage("");

                                        alert(
                                            data.success
                                                ? "Thanks! Report submitted."
                                                : "Error: " + data.error
                                        );
                                    } catch (err) {
                                        alert("Error contacting backend. Please try again later.");
                                    }
                                }}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );


}

export default DrawerTabContent;
