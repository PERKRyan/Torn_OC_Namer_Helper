// ==UserScript==
// @name         OC Role Display - PERK_Ryan Edition
// @namespace    http://tampermonkey.net/
// @version      1.4.0
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
                "IMPERSONATOR": 70,
                "MUSCLE 1": 70,
                "MUSCLE 2": 70,
                "HACKER": 70,
                "DRIVER": 70
            },
            PositionPriority: {
                   "IMPERSONATOR": "P1",
                   "MUSCLE 1": "P2",
                   "MUSCLE 2": "P3",
                   "HACKER": "P4",
                   "DRIVER": "P5"
               }
        },
        {
            OCName: "Stacking the Deck",
            Positions: {
                "CAT BURGLAR": 70,
                "DRIVER": 70,
                "HACKER": 70,
                "IMPERSONATOR": 70
            },
            PositionPriority: {
                   "CAT BURGLAR": "P1",
                   "DRIVER": "P2",
                   "HACKER": "P3",
                   "IMPERSONATOR": "P4"
               }
        },
        {
            OCName: "Break the Bank",
            Positions: {
                "ROBBER": 60,
                "MUSCLE 1": 60,
                "MUSCLE 2": 60,
                "THIEF 1": 60,
                "MUSCLE 3": 60,
                "THIEF 2": 60
            },
            PositionPriority: {
                  "ROBBER": "P1",
                  "MUSCLE 1": "P1",
                  "MUSCLE 2": "P1",
                  "THIEF 1": "P1",
                  "MUSCLE 3": "P1",
                  "THIEF 2": "P1"
              }
        },
        {
            OCName: "Blast from the Past",
            Positions: {
                "PICKLOCK 1": 50,
                "HACKER": 50,
                "ENGINEER": 70,
                "BOMBER": 70,
                "MUSCLE": 70,
                "PICKLOCK 2": 40
            },
            PositionPriority: {
                "PICKLOCK 1": "P1",
                "HACKER": "P1",
                "ENGINEER": "P1",
                "BOMBER": "P1",
                "MUSCLE": "P1",
                "PICKLOCK 2": "P1"
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
            },
            PositionPriority: {
                "ROBBER 1": "P1",
                "DRIVER": "P1",
                "ROBBER 2": "P1",
                "ROBBER 3": "P1",
                "BOMBER 1": "P1",
                "BOMBER 2": "P1"
            }
        },
        { 
            OCName: "Honey Trap", 
            Positions: {
                "ENFORCER": 40,
                "MUSCLE 1": 60,
                "MUSCLE 2": 70
            },
            PositionPriority: {
                "ENFORCER": "P1",
                "MUSCLE 1": "P1",
                "MUSCLE 2": "P1"
            }
        },
        {
            OCName: "No Reserve",
            Positions: {
                "CAR THIEF": 70,
                "TECHIE": 70,
                "ENGINEER": 70
            },
            PositionPriority: {
                "CAR THIEF": "P1",
                "TECHIE": "P1",
                "ENGINEER": "P1"
            }
        },
        { 
            OCName: "Leave No Trace", 
            Positions: {
                "TECHIE": 40,
                "NEGOTIATOR": 70,
                "IMPERSONATOR": 70
            },
            PositionPriority: {
                "TECHIE": "P1",
                "NEGOTIATOR": "P1",
                "IMPERSONATOR": "P1"
            }
        },
        { 
            OCName: "Stage Fright", 
            Positions: {
                "ENFORCER": 60,
                "MUSCLE 1": 70,
                "MUSCLE 2": 40,
                "MUSCLE 3": 40,
                "LOOKOUT": 40,
                "SNIPER": 70
            },
            PositionPriority: {
                "ENFORCER": "P1",
                "MUSCLE 1": "P1",
                "MUSCLE 2": "P1",
                "MUSCLE 3": "P1",
                "LOOKOUT": "P1",
                "SNIPER": "P1"
            }
        },
        { 
            OCName: "Snow Blind", 
            Positions: {
                "HUSTLER": 70,
                "IMPERSONATOR": 70,
                "MUSCLE 1": 40,
                "MUSCLE 2": 40
            },
            PositionPriority: {
                   "HUSTLER": "P1",
                   "IMPERSONATOR": "P1",
                   "MUSCLE 1": "P1",
                   "MUSCLE 2": "P1"
               }
        },
        { 
            OCName: "Smoke and Wing Mirrors", 
            Positions: {
                "CAR THIEF": 70,
                "IMPERSONATOR": 70,
                "HUSTLER 1": 50,
                "HUSTLER 2": 50
            },
            PositionPriority: {
                "CAR THIEF": "P1",
                "IMPERSONATOR": "P1",
                "HUSTLER 1": "P1",
                "HUSTLER 2": "P1"
            }
        },
        { 
            OCName: "Market Forces",
            Positions: {
                "ENFORCER": 40,
                "NEGOTIATOR": 70,
                "LOOKOUT": 70,
                "ARSONIST": 40,
                "MUSCLE": 40
            },
            PositionPriority: {
                "ENFORCER": "P1",
                "NEGOTIATOR": "P1",
                "LOOKOUT": "P1",
                "ARSONIST": "P1",
                "MUSCLE": "P1"
            }
        },
        { 
            OCName: "Best of the Lot", 
            Positions: {
                "PICKLOCK": 70,
                "CAR THIEF": 40,
                "MUSCLE": 70,
                "IMPERSONATOR": 40
            },
            PositionPriority: {
                "PICKLOCK": "P1",
                "CAR THIEF": "P1",
                "MUSCLE": "P1",
                "IMPERSONATOR": "P1"
            }
        },
        { 
            OCName: "Cash Me if You Can",
            Positions: {
                "THIEF 1": 70,
                "THIEF 2": 40,
                "LOOKOUT": 60
            },
            PositionPriority: {
                "THIEF 1": "P1",
                "THIEF 2": "P1",
                "LOOKOUT": "P1"
            }
        },
        { 
            OCName: "Mob Mentality", 
            Positions: {
                "LOOTER 1": 10,
                "LOOTER 2": 10,
                "LOOTER 3": 10,
                "LOOTER 4": 10
            },
            PositionPriority: {
                "LOOTER 1": "P1",
                "LOOTER 2": "P1",
                "LOOTER 3": "P1",
                "LOOTER 4": "P1"
            }
        },
        { 
            OCName: "Pet Project",
            Positions: {
                "KIDNAPPER": 10,
                "MUSCLE": 10,
                "PICKLOCK": 10
            },
            PositionPriority: {
                "KIDNAPPER": "P1",
                "MUSCLE": "P1",
                "PICKLOCK": "P1"
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
       let priorityPrefix = '';
 
       if (ocData) {
         if (typeof ocData.Positions === 'object') {
           const baseName = finalName.replace(/\s\d+$/, '');
           if (ocData.Positions[finalName] !== undefined) {
             required = ocData.Positions[finalName];
           } else if (ocData.Positions[baseName] !== undefined) {
             required = ocData.Positions[baseName];
           }
 
           if (ocData.PositionPriority && ocData.PositionPriority[baseName]) {
             priorityPrefix = `${ocData.PositionPriority[baseName]} `;
           }
         }
       }
 
       if (required !== null) {
         const honorTextSpans = slot.querySelectorAll('.honor-text');
         const userName = (honorTextSpans.length > 1) ? honorTextSpans[1].textContent.trim() : null;
 
         if (!userName) {
           slot.style.backgroundColor =
             (successChance < required) ? '#ff000061' : '#21a61c61';
         }
 
         if (joinBtn) {
           if (successChance < required) {
             joinBtn.setAttribute('disabled', '');
           }
         }
 
         if (userName && successChance < required) {
           slot.classList.add('pulse-border-red');
           slot.style.outline = '4px solid red';
           slot.style.outlineOffset = '0px';
         }
       }
 
       const roleElem = slot.querySelector('.title___UqFNy');
       if (finalName && roleElem) {
         const updatedName = `${priorityPrefix}${finalName}`;
         if (roleElem.innerText.trim() !== updatedName) {
           roleElem.innerText = updatedName;
         }
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
