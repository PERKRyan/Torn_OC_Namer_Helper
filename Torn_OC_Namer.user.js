// ==UserScript==
// @name         OC Role Display - PERK_Ryan Edition
// @namespace    http://tampermonkey.net/
// @version      1.3.3
// @description  Dynamically numbers duplicate OC roles based on slot order
// @author       PERK_Ryan (made from Allenone and NotIbbyz work)
// @match        https://www.torn.com/factions.php?step=your*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        GM_info
// @license      MIT
// ==/UserScript==
 
(async function() {
    'use strict';
 
    // Inject pulse animations
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes pulseRed {
        0% { box-shadow: 0 0 8px red; }
        50% { box-shadow: 0 0 18px red; }
        100% { box-shadow: 0 0 8px red; }
    }
    .pulse-border-red {
        animation: pulseRed 1s infinite;
    }
    `;
    document.head.appendChild(style);
 
    const defaultCPR1 = 70;
    const defaultCPR2 = 70;
    const defaultCPR3 = 70;

    const ocRoles = [
        {
            OCName: "Ace in the Hole",
            Positions: {
                "IMPERSONATOR": 62,
                "MUSCLE 1": 62,
                "MUSCLE 2": 55,
                "HACKER": 60,
                "DRIVER": 60
            }
        },
        {
            OCName: "Stacking the Deck",
            Positions: {
                "CAT BURGLAR": 62,
                "DRIVER": 62,
                "HACKER": 55,
                "IMPERSONATOR": 55
            }
        },
        {
            OCName: "Break The Bank",
            Positions: {
                "ROBBER": 62,
                "MUSCLE 1": 62,
                "MUSCLE 2": 55,
                "THIEF 1": 55,
                "MUSCLE 3": 60,
                "THIEF 2": 60
            }
        },
        {
            OCName: "Blast From The Past",
            Positions: {
                "PICKLOCK 1": 70,
                "HACKER": 70,
                "ENGINEER": 70,
                "BOMBER": 70,
                "MUSCLE": 70,
                "PICKLOCK 2": 67
            }
        },
        {
            OCName: "Bidding War",
            Positions: {
                "ROBBER 1": 70,
                "DRIVER": 70,
                "ROBBER 2": 70,
                "ROBBER 3": 70,
                "BOMBER 1": 70,
                "BOMBER 2": 70
            }
        },
        { 
            OCName: "Honey Trap", 
            Positions: {
                "ENFORCER": 70,
                "MUSCLE 1": 70,
                "MUSCLE 2": 67
            } 
        },
        {
            OCName: "No Reserve",
            Positions: {
                "CAR THIEF": 70,
                "TECHIE": 70,
                "ENGINEER": 70
            }
        },
        { 
            OCName: "Leave No Trace", 
            Positions: {
                "TECHIE": 70,
                "NEGOTIATOR": 70,
                "IMPERSONATOR": 70
            } 
        },
        { 
            OCName: "Stage Fright", 
            Positions: {
                "ENFORCER": 70,
                "MUSCLE 1": 70,
                "MUSCLE 2": 70,
                "MUSCLE 3": 70,
                "LOOKOUT": 70,
                "SNIPER": 67
            } 
        },
        { 
            OCName: "Snow Blind", 
            Positions: {
                "HUSTLER": 70,
                "IMPERSONATOR": 70,
                "MUSCLE 1": 70,
                "MUSCLE 2": 70
            } 
        },
        { 
            OCName: "Smoke and Wing Mirrors", 
            Positions: {
                "CAR THIEF": 70,
                "IMPERSONATOR": 70,
                "HUSTLER 1": 70,
                "HUSTLER 2": 70
            } 
        },
        { 
            OCName: "Market Forces",
            Positions: {
                "ENFORCER": 70,
                "NEGOTIATOR": 70,
                "LOOKOUT": 70,
                "ARSONIST": 70,
                "MUSCLE": 70
            } 
        },
        { 
            OCName: "Best of the Lot", 
            Positions: {
                "PICKLOCK": 70,
                "CAR THIEF": 70,
                "MUSCLE": 70,
                "IMPERSONATOR": 70
            } 
        },
        { 
            OCName: "Cash Me If You Can",
            Positions: {
                "THIEF 1": 70,
                "THIEF 2": 70,
                "LOOKOUT": 70
            } 
        },
        { 
            OCName: "Mob Mentality", 
            Positions: {
                "LOOTER 1": 70,
                "LOOTER 2": 70,
                "LOOTER 3": 70,
                "LOOTER 4": 70
            } 
        },
        { 
            OCName: "Pet Project",
            Positions: {
                "KIDNAPPER": 70,
                "MUSCLE": 70,
                "PICKLOCK": 67
            } 
        }
    ];
 
    const roleMappings = {};
 
    function processScenario(panel) {
        if (panel.classList.contains('role-processed')) return;
        panel.classList.add('role-processed');
 
        const ocName = panel.querySelector('.panelTitle___aoGuV')?.innerText.trim() || "Unknown";
        const slots = panel.querySelectorAll('.wrapper___Lpz_D');
 
        if (!roleMappings[ocName]) {
            const slotsWithPos = Array.from(slots).map(slot => {
                const fiberKey = Object.keys(slot).find(k => k.startsWith('__reactFiber$'));
                if (!fiberKey) return null;
                const fiberNode = slot[fiberKey];
                const slotKey = fiberNode.return.key.replace('slot-', '');
                const posNum = parseInt(slotKey.match(/P(\d+)/)?.[1] || '0', 10);
                return { slot, positionNumber: posNum };
            }).filter(Boolean);
 
            slotsWithPos.sort((a, b) => a.positionNumber - b.positionNumber);
 
            const originalNames = slotsWithPos.map(({ slot }) =>
                slot.querySelector('.title___UqFNy')?.innerText.trim() || 'Unknown'
            );
 
            const freq = {};
            originalNames.forEach(name => {
                freq[name] = (freq[name] || 0) + 1;
            });
 
            const finalNames = [];
            const counter = {};
            originalNames.forEach(name => {
                if (freq[name] > 1) {
                    counter[name] = (counter[name] || 0) + 1;
                    finalNames.push(`${name} ${counter[name]}`);
                } else {
                    finalNames.push(name);
                }
            });
 
            roleMappings[ocName] = finalNames;
        }
 
        Array.from(slots).forEach(slot => {
            const fiberKey = Object.keys(slot).find(k => k.startsWith('__reactFiber$'));
            if (!fiberKey) return;
            const fiberNode = slot[fiberKey];
            const positionKey = fiberNode.return.key.replace('slot-', '');
            const posNum = parseInt(positionKey.match(/P(\d+)/)?.[1] || '0', 10);
            const roleIndex = posNum - 1;
 
            const finalName = roleMappings[ocName][roleIndex];
            const successStr = slot.querySelector('.successChance___ddHsR')?.textContent.trim() || '';
            const successChance = parseInt(successStr, 10) || 0;
            const joinBtn = slot.querySelector("button[class^='torn-btn joinButton']");
 
            const ocData = ocRoles.find(o => o.OCName === ocName);
            let required = null;
            if (ocData) {
                if (typeof ocData.Positions === 'string' && ocData.Positions.startsWith('default_')) {
                    required = parseInt(ocData.Positions.split('_')[1], 10) || 70;
                } else if (typeof ocData.Positions === 'object') {
                    if (ocData.Positions[finalName] !== undefined) {
                        required = ocData.Positions[finalName];
                    }
                }
            }
 
            if (required !== null) {
                const honorTextSpans = slot.querySelectorAll('.honor-text');
                const userName = (honorTextSpans.length > 1) ? honorTextSpans[1].textContent.trim() : null;
 
                // Only highlight join slots (empty) in green/red
                if (!userName) {
                    slot.style.backgroundColor =
                        (successChance < required) ? '#ff000061' : '#21a61c61';
                }
 
                if (joinBtn) {
                    if (successChance < required) {
                        joinBtn.setAttribute('disabled', '');
                    } 
                }
 
                // Highlight assigned players only if successChance < required
                if (userName && successChance < required) {
                    slot.classList.add('pulse-border-red');
                    slot.style.outline = '4px solid red';
                    slot.style.outlineOffset = '0px';
 
                }
            }
                        // Update displayed role name if different
            const roleElem = slot.querySelector('.title___UqFNy');
            if (finalName && roleElem && roleElem.innerText.trim() !== finalName) {
                roleElem.innerText = finalName;
            }
 
        });
    }
 
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches('.wrapper___U2Ap7')) {
                        processScenario(node);
                    }
                    if (node.nodeType === 1) {
                        const innerPanels = node.querySelectorAll?.('.wrapper___U2Ap7') || [];
                        innerPanels.forEach(inner => processScenario(inner));
                    }
                });
            }
        });
    });
 
    const targetNode = document.querySelector('#factionCrimes-root') || document.body;
    observer.observe(targetNode, {
        childList: true,
        subtree: true
    });
 
    window.addEventListener('load', () => {
        document.querySelectorAll('.wrapper___U2Ap7').forEach(panel => {
            processScenario(panel);
        });
    });
 
})();