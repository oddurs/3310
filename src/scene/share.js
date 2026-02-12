const W98 = '"MS Sans Serif","Microsoft Sans Serif",Tahoma,sans-serif'
const W98_RAISED = 'border-top:2px solid #fff;border-left:2px solid #fff;border-bottom:2px solid #000;border-right:2px solid #000;'
const W98_INSET = 'border-top:2px solid #808080;border-left:2px solid #808080;border-bottom:2px solid #fff;border-right:2px solid #fff;'
const W98_BTN = `background:#c0c0c0;width:16px;height:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:${W98};padding:0;box-shadow:inset -1px -1px 0 #000,inset 1px 1px 0 #fff,inset -2px -2px 0 #808080,inset 2px 2px 0 #dfdfdf;border:none;`

const spacer = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// Pixel art icons for sharing methods (16x16 SVGs)
const iconEmail = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'%3E%3Crect x='1' y='3' width='14' height='10' fill='%23ddd' stroke='%23666' stroke-width='1'/%3E%3Cpath d='M1,3 L8,9 L15,3' fill='none' stroke='%23666' stroke-width='1'/%3E%3Cpath d='M1,13 L6,8' fill='none' stroke='%23999' stroke-width='1'/%3E%3Cpath d='M15,13 L10,8' fill='none' stroke='%23999' stroke-width='1'/%3E%3C/svg%3E"
const iconAIM = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'%3E%3Crect x='4' y='1' width='8' height='8' rx='4' fill='%23FFD700'/%3E%3Crect x='6' y='3' width='2' height='2' fill='%23000'/%3E%3Crect x='9' y='3' width='2' height='2' fill='%23000'/%3E%3Crect x='5' y='6' width='6' height='1' fill='%23000'/%3E%3Crect x='3' y='10' width='10' height='5' rx='1' fill='%23FFD700'/%3E%3Crect x='5' y='11' width='6' height='3' fill='%23fff'/%3E%3C/svg%3E"
const iconICQ = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'%3E%3Crect x='3' y='1' width='10' height='10' rx='5' fill='%2380CC28'/%3E%3Crect x='5' y='3' width='6' height='6' rx='3' fill='%23fff'/%3E%3Crect x='7' y='5' width='2' height='2' fill='%2380CC28'/%3E%3Crect x='7' y='12' width='2' height='3' fill='%2380CC28'/%3E%3C/svg%3E"
const iconClipboard = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'%3E%3Crect x='3' y='2' width='10' height='13' fill='%23c4a66a' stroke='%23806030' stroke-width='1'/%3E%3Crect x='5' y='0' width='6' height='3' fill='%23888' stroke='%23555' stroke-width='1'/%3E%3Crect x='5' y='5' width='6' height='1' fill='%23333'/%3E%3Crect x='5' y='7' width='6' height='1' fill='%23333'/%3E%3Crect x='5' y='9' width='4' height='1' fill='%23333'/%3E%3Crect x='5' y='11' width='6' height='1' fill='%23333'/%3E%3C/svg%3E"
const iconPrint = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'%3E%3Crect x='4' y='1' width='8' height='4' fill='%23fff' stroke='%23666' stroke-width='1'/%3E%3Crect x='2' y='5' width='12' height='6' fill='%23ccc' stroke='%23666' stroke-width='1'/%3E%3Crect x='4' y='10' width='8' height='5' fill='%23fff' stroke='%23666' stroke-width='1'/%3E%3Crect x='11' y='7' width='2' height='2' rx='1' fill='%2380CC28'/%3E%3Crect x='5' y='12' width='5' height='1' fill='%23999'/%3E%3C/svg%3E"
const iconFloppy = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'%3E%3Crect x='1' y='1' width='14' height='14' fill='%23336' stroke='%23224' stroke-width='1'/%3E%3Crect x='3' y='1' width='8' height='5' fill='%23ddd'/%3E%3Crect x='8' y='2' width='2' height='3' fill='%23888'/%3E%3Crect x='3' y='8' width='10' height='7' fill='%23fff'/%3E%3Crect x='4' y='10' width='7' height='1' fill='%23ccc'/%3E%3Crect x='4' y='12' width='5' height='1' fill='%23ccc'/%3E%3C/svg%3E"
const iconGlobe = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'%3E%3Ccircle cx='8' cy='8' r='7' fill='%234488cc' stroke='%23336699' stroke-width='1'/%3E%3Cellipse cx='8' cy='8' rx='3' ry='7' fill='none' stroke='%23fff' stroke-width='0.8' opacity='0.5'/%3E%3Crect x='1' y='5' width='14' height='0.8' fill='%23fff' opacity='0.4'/%3E%3Crect x='1' y='10' width='14' height='0.8' fill='%23fff' opacity='0.4'/%3E%3C/svg%3E"
const iconHeart = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'%3E%3Crect x='2' y='3' width='3' height='3' fill='%23e33'/%3E%3Crect x='6' y='3' width='3' height='3' fill='%23e33'/%3E%3Crect x='11' y='3' width='3' height='3' fill='%23e33'/%3E%3Crect x='1' y='5' width='14' height='3' fill='%23e33'/%3E%3Crect x='2' y='8' width='12' height='2' fill='%23e33'/%3E%3Crect x='3' y='10' width='10' height='1' fill='%23e33'/%3E%3Crect x='4' y='11' width='8' height='1' fill='%23e33'/%3E%3Crect x='5' y='12' width='6' height='1' fill='%23e33'/%3E%3Crect x='6' y='13' width='4' height='1' fill='%23e33'/%3E%3Crect x='7' y='14' width='2' height='1' fill='%23e33'/%3E%3C/svg%3E"
const iconBanner = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' shape-rendering='crispEdges'%3E%3Crect x='1' y='2' width='14' height='12' fill='%23fff' stroke='%23999' stroke-width='1'/%3E%3Crect x='2' y='3' width='12' height='2' fill='%23003580'/%3E%3Crect x='2' y='6' width='8' height='1' fill='%23ccc'/%3E%3Crect x='2' y='8' width='10' height='1' fill='%23ccc'/%3E%3Crect x='2' y='10' width='6' height='1' fill='%23ccc'/%3E%3Crect x='9' y='9' width='4' height='4' fill='%23699' stroke='%23477' stroke-width='0.5'/%3E%3C/svg%3E"

const SHARE_URL = 'https://3310.love'
const SHARE_TITLE = '3310.love — Nokia Snake II'
const SHARE_DESC = 'Play Snake II on a 3D Nokia 3310 in your browser! Free, no downloads. Pure Y2K nostalgia.'

export function createSharePopup() {
  let popW = 440, popH = 460
  let popX = Math.round((window.innerWidth - popW) / 2) + 30
  let popY = Math.round((window.innerHeight - popH) / 2) - 10
  let maximized = false, savedBounds = null

  const popup = document.createElement('div')
  popup.style.cssText = `position:fixed;z-index:52;background:#c0c0c0;${W98_RAISED}padding:2px;font-family:${W98};font-size:11px;image-rendering:pixelated;display:none;flex-direction:column;`

  function applyBounds() {
    popup.style.left = popX + 'px'
    popup.style.top = popY + 'px'
    popup.style.width = popW + 'px'
    popup.style.height = popH + 'px'
  }

  // --- Title bar ---
  const titleBar = document.createElement('div')
  titleBar.style.cssText = 'background:linear-gradient(90deg,#000080,#1084d0);color:#fff;font-weight:bold;font-size:11px;padding:2px 3px;display:flex;align-items:center;justify-content:space-between;margin-bottom:1px;cursor:default;user-select:none;flex-shrink:0;'

  const titleText = document.createElement('span')
  titleText.style.cssText = 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'
  titleText.innerHTML = '<span style="font-size:10px;">&#128228;</span> Share 3310.love - Microsoft Internet Explorer'
  titleBar.appendChild(titleText)

  const winBtns = document.createElement('div')
  winBtns.style.cssText = 'display:flex;gap:1px;flex-shrink:0;margin-left:4px;'

  const minBtn = document.createElement('div')
  minBtn.style.cssText = W98_BTN
  minBtn.innerHTML = '<svg width="8" height="7" viewBox="0 0 8 7" shape-rendering="crispEdges"><rect x="0" y="5" width="7" height="2" fill="#000"/></svg>'

  const maxBtn = document.createElement('div')
  maxBtn.style.cssText = W98_BTN
  const svgMax = '<svg width="9" height="9" viewBox="0 0 9 9" shape-rendering="crispEdges"><rect x="0" y="0" width="9" height="9" fill="none" stroke="#000" stroke-width="1"/><rect x="0" y="0" width="9" height="3" fill="#000"/></svg>'
  const svgRestore = '<svg width="9" height="9" viewBox="0 0 9 9" shape-rendering="crispEdges"><rect x="2" y="0" width="7" height="7" fill="none" stroke="#000" stroke-width="1"/><rect x="2" y="0" width="7" height="2" fill="#000"/><rect x="0" y="2" width="7" height="7" fill="#c0c0c0" stroke="#000" stroke-width="1"/><rect x="0" y="2" width="7" height="2" fill="#000"/></svg>'
  maxBtn.innerHTML = svgMax

  const closeBtn = document.createElement('div')
  closeBtn.style.cssText = W98_BTN
  closeBtn.innerHTML = '<svg width="7" height="7" viewBox="0 0 7 7" shape-rendering="crispEdges"><path d="M0,0 L3,3 L0,6 L1,7 L3.5,3.5 L6,7 L7,6 L4,3 L7,0 L6,0 L3.5,2.5 L1,0Z" fill="#000"/></svg>'

  winBtns.append(minBtn, maxBtn, closeBtn)
  titleBar.appendChild(winBtns)

  // --- Menu bar ---
  const menuBar = document.createElement('div')
  menuBar.style.cssText = 'background:#c0c0c0;padding:1px 2px;font-size:11px;border-bottom:1px solid #808080;flex-shrink:0;'
  menuBar.innerHTML = '<span style="padding:1px 5px;">File</span><span style="padding:1px 5px;">Edit</span><span style="padding:1px 5px;">View</span><span style="padding:1px 5px;">Favorites</span><span style="padding:1px 5px;">Help</span>'

  // --- Address bar ---
  const addrBar = document.createElement('div')
  addrBar.style.cssText = 'background:#c0c0c0;padding:2px 4px;display:flex;align-items:center;gap:4px;border-bottom:1px solid #808080;flex-shrink:0;'
  const addrUrl = document.createElement('div')
  addrUrl.style.cssText = `flex:1;background:#fff;${W98_INSET}padding:1px 3px;font-size:11px;white-space:nowrap;overflow:hidden;`
  addrUrl.textContent = 'http://www.3310.love/share'
  addrBar.innerHTML = '<span style="font-size:11px;white-space:nowrap;">Address</span>'
  addrBar.appendChild(addrUrl)

  // --- Content ---
  const content = document.createElement('div')
  content.style.cssText = `background:#fff;${W98_INSET}flex:1;overflow-y:auto;min-height:0;`

  // Status message (shown when user clicks a share action)
  let statusMsg = ''
  function flashStatus(msg) {
    statusMsg = msg
    statusText.innerHTML = '&#128228; ' + msg
    setTimeout(() => { statusText.innerHTML = '&#127760; Done' }, 3000)
  }

  content.innerHTML = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="#003580" style="background:linear-gradient(180deg,#004090,#002a60);">
          <table width="100%" cellpadding="6" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <font face="Arial,Helvetica" color="#FFFFFF" size="3"><b>&#128228; Share 3310.love</b></font><br>
                <font face="Arial,Helvetica" color="#8899BB" size="1">SPREAD THE NOSTALGIA</font>
              </td>
              <td align="right" valign="middle">
                <img src="${iconHeart}" width="28" height="28" style="opacity:0.4;">
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td bgcolor="#FFD700" height="2"><img src="${spacer}" width="1" height="2"></td></tr>
      <tr><td bgcolor="#003580" height="1"><img src="${spacer}" width="1" height="1"></td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:'Times New Roman',Times,serif;font-size:13px;color:#333;">
      <tr>
        <td valign="top" style="padding:10px 14px;">
          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9670; Tell Your Friends!</b></font>
          <br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 8px;">

          <font face="'Times New Roman',serif" size="2">
            Know someone who misses the good old days of Snake on the Nokia 3310?
            Share this site with them! Choose your preferred method below:
          </font>

          <br><br>

          <!-- Share methods table -->
          <table width="100%" cellpadding="4" cellspacing="0" border="1" bordercolor="#999" style="font-family:Arial,Helvetica;font-size:10px;border-collapse:collapse;">
            <tr bgcolor="#003580">
              <td width="36" align="center"><font color="#FFF"><b>&nbsp;</b></font></td>
              <td><font color="#FFF"><b>METHOD</b></font></td>
              <td width="70" align="center"><font color="#FFF"><b>ACTION</b></font></td>
            </tr>
            <tr bgcolor="#F0F0E8" style="cursor:pointer;" data-share="email">
              <td align="center"><img src="${iconEmail}" width="20" height="20"></td>
              <td>
                <b>E-Mail</b><br>
                <font color="#666">Send to a friend via electronic mail</font>
              </td>
              <td align="center">
                <span style="background:#c0c0c0;${W98_RAISED}padding:1px 8px;cursor:pointer;font-size:10px;" data-share="email">&nbsp;Send!&nbsp;</span>
              </td>
            </tr>
            <tr style="cursor:pointer;" data-share="copy">
              <td align="center"><img src="${iconClipboard}" width="20" height="20"></td>
              <td>
                <b>Copy Link</b><br>
                <font color="#666">Copy URL to clipboard &mdash; paste anywhere!</font>
              </td>
              <td align="center">
                <span style="background:#c0c0c0;${W98_RAISED}padding:1px 8px;cursor:pointer;font-size:10px;" data-share="copy">&nbsp;Copy!&nbsp;</span>
              </td>
            </tr>
            <tr bgcolor="#F0F0E8" style="cursor:pointer;" data-share="aim">
              <td align="center"><img src="${iconAIM}" width="20" height="20"></td>
              <td>
                <b>AIM / Messenger</b><br>
                <font color="#666">Paste into your away message or IM a buddy</font>
              </td>
              <td align="center">
                <span style="background:#c0c0c0;${W98_RAISED}padding:1px 8px;cursor:pointer;font-size:10px;" data-share="aim">&nbsp;Copy!&nbsp;</span>
              </td>
            </tr>
            <tr style="cursor:pointer;" data-share="icq">
              <td align="center"><img src="${iconICQ}" width="20" height="20"></td>
              <td>
                <b>ICQ</b><br>
                <font color="#666">Send an ICQ message &mdash; uh oh!</font>
              </td>
              <td align="center">
                <span style="background:#c0c0c0;${W98_RAISED}padding:1px 8px;cursor:pointer;font-size:10px;" data-share="icq">&nbsp;Copy!&nbsp;</span>
              </td>
            </tr>
            <tr bgcolor="#F0F0E8" style="cursor:pointer;" data-share="print">
              <td align="center"><img src="${iconPrint}" width="20" height="20"></td>
              <td>
                <b>Print This Page</b><br>
                <font color="#666">Print &amp; hand to friends (save paper, save trees)</font>
              </td>
              <td align="center">
                <span style="background:#c0c0c0;${W98_RAISED}padding:1px 8px;cursor:pointer;font-size:10px;" data-share="print">&nbsp;Print!&nbsp;</span>
              </td>
            </tr>
            <tr style="cursor:pointer;" data-share="floppy">
              <td align="center"><img src="${iconFloppy}" width="20" height="20"></td>
              <td>
                <b>Save to Floppy Disk</b><br>
                <font color="#666">Bookmark this URL on a 3&frac12;" diskette</font>
              </td>
              <td align="center">
                <span style="background:#c0c0c0;${W98_RAISED}padding:1px 8px;cursor:pointer;font-size:10px;" data-share="floppy">&nbsp;Save!&nbsp;</span>
              </td>
            </tr>
          </table>

          <br>
          <img src="${spacer}" width="100%" height="1" style="background:#DDD;display:block;">
          <br>

          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9670; Link To Us!</b></font>
          <br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 6px;">

          <font face="'Times New Roman',serif" size="2">
            Want to link to <b>3310.love</b> from your homepage? Copy this HTML:
          </font>
          <br><br>

          <table width="100%" cellpadding="4" cellspacing="0" border="1" bordercolor="#999" bgcolor="#F8F8F0" style="font-family:Courier New,monospace;font-size:10px;">
            <tr><td style="word-break:break-all;line-height:1.4;">
              <font color="#0000CC">&lt;a href=&quot;https://3310.love&quot;&gt;</font><font color="#333">Play Snake II on a 3D Nokia 3310!</font><font color="#0000CC">&lt;/a&gt;</font>
            </td></tr>
          </table>

          <br>

          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9670; Add Our Banner!</b></font>
          <br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 6px;">

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <table cellpadding="6" cellspacing="0" border="2" bordercolor="#003580" bgcolor="#001830">
                  <tr><td align="center" style="font-family:Arial,Helvetica;">
                    <font color="#FFD700" size="2"><b>&#9733; 3310.love &#9733;</b></font><br>
                    <font color="#c7cfa1" size="1">Play Snake II in your browser!</font><br>
                    <font color="#8899BB" size="1">&#9658; Click Here &#9668;</font>
                  </td></tr>
                </table>
                <br>
                <font face="Arial" size="1" color="#999">banner.gif (2KB) &mdash; Right-click &rarr; Save As</font>
              </td>
            </tr>
          </table>

          <br>
          <img src="${spacer}" width="100%" height="1" style="background:#DDD;display:block;">
          <br>

          <font face="Arial,Helvetica" size="2" color="#003580"><b>&#9670; Webring</b></font>
          <br>
          <img src="${spacer}" width="100%" height="1" style="background:linear-gradient(90deg,#003580,#fff);display:block;margin:3px 0 6px;">

          <table width="100%" cellpadding="4" cellspacing="0" border="1" bordercolor="#999" bgcolor="#FFFFF0" style="font-family:Arial,Helvetica;font-size:10px;">
            <tr><td align="center">
              <img src="${iconGlobe}" width="16" height="16" style="vertical-align:middle;">
              <font color="#003580"><b>Nokia Fans Webring</b></font>
              <br><br>
              [ <u>Prev</u> | <u>Random</u> | <b>This Site</b> | <u>Next</u> | <u>List All</u> ]
              <br><br>
              <font color="#999" size="1">Member since January 2001 &mdash; Ring ID #247</font>
            </td></tr>
          </table>

          <br>

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center">
              <font face="Arial" size="1" color="#999">
                &#9679; Sharing is caring! &nbsp;&#9679;&nbsp; No spam please &nbsp;&#9679;&nbsp; Page size: 4KB
              </font>
            </td></tr>
          </table>
          <br>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td bgcolor="#003580" height="2"><img src="${spacer}" width="1" height="2"></td></tr>
      <tr><td bgcolor="#FFD700" height="1"><img src="${spacer}" width="1" height="1"></td></tr>
      <tr>
        <td bgcolor="#E8E8E0" align="center" style="padding:8px;font-family:Arial,Helvetica;font-size:9px;color:#666;">
          &copy; 2000&ndash;2001 3310.love &mdash; Share the love!
          <br>
          <font face="Courier New" size="1" color="#AAA">
            &#9472;&#9472;&#9472; Built with &#9829; in Brooklyn &#9472;&#9472;&#9472;
          </font>
        </td>
      </tr>
    </table>
  `

  // Handle share actions
  content.addEventListener('click', (e) => {
    const action = e.target.closest('[data-share]')
    if (!action) return
    const type = action.dataset.share

    switch (type) {
      case 'email': {
        const subject = encodeURIComponent(SHARE_TITLE)
        const body = encodeURIComponent(`Check this out!\n\n${SHARE_DESC}\n\n${SHARE_URL}\n\n-- Sent from the year 2001`)
        window.open(`mailto:?subject=${subject}&body=${body}`)
        flashStatus('Opening email client...')
        break
      }
      case 'copy':
      case 'aim':
      case 'icq':
        navigator.clipboard.writeText(SHARE_URL).then(() => {
          flashStatus('URL copied to clipboard!')
        })
        break
      case 'print':
        flashStatus('Preparing to print... (just kidding)')
        break
      case 'floppy':
        flashStatus('Error: Drive A: not found :-)')
        break
    }
  })

  // --- Status bar ---
  const statusBar = document.createElement('div')
  statusBar.style.cssText = `${W98_INSET}background:#c0c0c0;padding:1px 4px;font-size:10px;color:#000;margin-top:1px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;`

  const statusText = document.createElement('span')
  statusText.innerHTML = '&#127760; Done'

  const resizeGrip = document.createElement('div')
  resizeGrip.style.cssText = 'width:13px;height:13px;cursor:se-resize;flex-shrink:0;overflow:hidden;'
  resizeGrip.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13"><rect x="9" y="11" width="2" height="2" fill="#808080"/><rect x="10" y="12" width="2" height="2" fill="#fff"/><rect x="5" y="11" width="2" height="2" fill="#808080"/><rect x="6" y="12" width="2" height="2" fill="#fff"/><rect x="9" y="7" width="2" height="2" fill="#808080"/><rect x="10" y="8" width="2" height="2" fill="#fff"/><rect x="1" y="11" width="2" height="2" fill="#808080"/><rect x="2" y="12" width="2" height="2" fill="#fff"/><rect x="5" y="7" width="2" height="2" fill="#808080"/><rect x="6" y="8" width="2" height="2" fill="#fff"/><rect x="9" y="3" width="2" height="2" fill="#808080"/><rect x="10" y="4" width="2" height="2" fill="#fff"/></svg>'

  statusBar.append(statusText, resizeGrip)

  popup.append(titleBar, menuBar, addrBar, content, statusBar)
  popup.addEventListener('wheel', (e) => { e.stopPropagation() }, { passive: true })
  document.body.appendChild(popup)

  // --- Drag ---
  let dragActive = false, dragOX = 0, dragOY = 0
  titleBar.addEventListener('pointerdown', (e) => {
    if (winBtns.contains(e.target)) return
    if (maximized) return
    dragActive = true
    dragOX = e.clientX - popX
    dragOY = e.clientY - popY
    titleBar.setPointerCapture(e.pointerId)
    e.preventDefault()
  })
  titleBar.addEventListener('pointermove', (e) => {
    if (!dragActive) return
    popX = e.clientX - dragOX
    popY = e.clientY - dragOY
    applyBounds()
  })
  titleBar.addEventListener('pointerup', () => { dragActive = false })
  titleBar.addEventListener('pointercancel', () => { dragActive = false })

  // --- Min / Max / Close ---
  minBtn.addEventListener('click', () => { popup.style.display = 'none' })
  closeBtn.addEventListener('click', () => { popup.style.display = 'none' })

  function toggleMaximize() {
    if (maximized) {
      popX = savedBounds.x; popY = savedBounds.y
      popW = savedBounds.w; popH = savedBounds.h
      maximized = false
      popup.style.borderStyle = 'solid'
      popup.style.borderWidth = '2px'
      popup.style.borderTopColor = '#fff'; popup.style.borderLeftColor = '#fff'
      popup.style.borderBottomColor = '#000'; popup.style.borderRightColor = '#000'
      resizeGrip.style.display = ''
      maxBtn.innerHTML = svgMax
    } else {
      savedBounds = { x: popX, y: popY, w: popW, h: popH }
      popX = 0; popY = 0
      popW = window.innerWidth; popH = window.innerHeight
      maximized = true
      popup.style.borderWidth = '0'
      resizeGrip.style.display = 'none'
      maxBtn.innerHTML = svgRestore
    }
    applyBounds()
  }
  maxBtn.addEventListener('click', toggleMaximize)
  titleBar.addEventListener('dblclick', (e) => {
    if (winBtns.contains(e.target)) return
    toggleMaximize()
  })

  // --- Resize ---
  let resizeActive = false, rSX = 0, rSY = 0, rSW = 0, rSH = 0
  resizeGrip.addEventListener('pointerdown', (e) => {
    if (maximized) return
    resizeActive = true
    rSX = e.clientX; rSY = e.clientY; rSW = popW; rSH = popH
    resizeGrip.setPointerCapture(e.pointerId)
    e.preventDefault()
    e.stopPropagation()
  })
  resizeGrip.addEventListener('pointermove', (e) => {
    if (!resizeActive) return
    popW = Math.max(320, rSW + e.clientX - rSX)
    popH = Math.max(200, rSH + e.clientY - rSY)
    applyBounds()
  })
  resizeGrip.addEventListener('pointerup', () => { resizeActive = false })
  resizeGrip.addEventListener('pointercancel', () => { resizeActive = false })

  function show() {
    if (popup.style.display === 'flex') return
    applyBounds()
    popup.style.display = 'flex'
  }

  return { show }
}
