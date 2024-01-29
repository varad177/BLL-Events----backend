export const getTemplate = (data , user) => {
  const editorData = JSON.parse(data.editor[0]);
  console.log(editorData);

   
  const dynamicContent = editorData.blocks.map(item => {
    switch (item.type) {
      case 'paragraph':
        const fontSize = item.data.text.includes('&nbsp;') ? '16px' : '16px';
        return `<p style="font-size: ${fontSize}; line-height: 1; margin-bottom: 10px;">${item.data.text}</p>`;

      case 'list':                                                           
        const listItems = item.data.items.map(li => `<li style="font-size: 16px; line-height: 1.5;">${li}</li>`).join('');
        const listTag = item.data.style === 'ordered' ? 'ol' : 'ul';
        return `<${listTag} style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">${listItems}</${listTag}>`;
      case 'header':
        return `<h2 style="font-size: 16px;  margin-bottom: 10px;">${item.data.text}</h2>`;
      default:
        return ''; // Handle other types if needed
    }
  }).join('');

 
  const template1 = `
  
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      td {
        margin: 0;
      }
      .fas {
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
        display: inline-block;
        font-style: normal;
        font-variant: normal;
        text-rendering: auto;
        line-height: 1;
      }
      .fa-angle-double-right:before {
        content: "\f101";
      }
      .fas {
        font-family: "Font Awesome 5 Free";
      }
      .fas {
        font-weight: 900;
      }
      /*! CSS Used from: Embedded */
      table {
        border-spacing: 0;
      }
      table td {
        border-collapse: collapse;
      }
      @media only screen and (max-width: 480px) {
        table {
          width: 100% !important;
        }
      }
      @media only screen and (max-width: 599px) {
        table {
          width: 100% !important;
        }
        table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
      }
      /*! CSS Used from: Embedded */
      @media print {
        .noprint2 {
          display: none;
        }
      }
      /*! CSS Used fontfaces */
      @font-face {
        font-family: "Font Awesome 5 Free";
        font-style: normal;
        font-weight: 400;
        font-display: auto;
        src: url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-regular-400.eot);
        src: url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-regular-400.eot?#iefix)
            format("embedded-opentype"),
          url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-regular-400.woff2)
            format("woff2"),
          url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-regular-400.woff)
            format("woff"),
          url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-regular-400.ttf)
            format("truetype"),
          url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-regular-400.svg#fontawesome)
            format("svg");
      }
      @font-face {
        font-family: "Font Awesome 5 Free";
        font-style: normal;
        font-weight: 900;
        font-display: auto;
        src: url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-solid-900.eot);
        src: url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-solid-900.eot?#iefix)
            format("embedded-opentype"),
          url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-solid-900.woff2)
            format("woff2"),
          url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-solid-900.woff)
            format("woff"),
          url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-solid-900.ttf)
            format("truetype"),
          url(https://use.fontawesome.com/releases/v5.8.2/webfonts/fa-solid-900.svg#fontawesome)
            format("svg");
      }

      .logo-wrapper {
        height: 12rem;
        width: 100%;
      }
      .logo {
        object-fit: contain;
      }
    </style>
    <title>Document</title>
  </head>
  <body>
    <table
      width="600"
      style="
        max-width: 600px;
        margin: 0 auto;
        box-shadow: 0 4px 22px -5px rgb(0 0 0 / 20%);
      "
      border="0"
      cellspacing="0"
      cellpadding="0"
      class="table upper_tbls"
      align="center"
      background="https://entrypass.bllconnect.org/assets/images/bgImg.jpeg"
    >
      <tbody>
        <tr>
          <td
            style="
              border-right: #e6e6e6 solid 1px;
              border-left: #e6e6e6 solid 1px;
              border-top: #e6e6e6 solid 1px;
              border-bottom: #e6e6e6 solid 1px;
              padding-top: 15px;
              padding-bottom: 15px;
              padding-left: 15px;
              padding-right: 15px;
            "
          >
            <table
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              style="
                border-right: gold solid 4px;
                border-left: gold solid 4px;
                border-top: gold solid 4px;
                border-bottom: gold solid 4px;
                background-color: #fff;
              "
            >
              <tbody>
                <tr class="noprint2">
                  <td height="15"></td>
                </tr>
                <tr>
                  <td>
                    <table
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="table"
                    >
                      <tbody>
                        <tr>
                          <td width="5%"></td>
                          <td width="90%">
                            <table
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                              class="table"
                            >
                              <tbody>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr style="text-align: center">
                                  <td
                                    style="
                                      color: gold;
                                      line-height: 1.1em;
                                      font-size: 2em;
                                      font-weight: bold;
                                    "
                                  >
                                    Entry Pass For
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr>
                                  <td height="10"></td>
                                </tr>
                                <tr style="text-align: center">
                                  <td
                                    style="
                                      color: #545454;
                                      line-height: 1.1em;
                                      font-size: 3em;
                                      font-weight: 700;
                                      text-transform: capitalize;
                                    "
                                  >
                                    ${user.name}
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr style="text-align: center">
                                  <td
                                    style="
                                      color: #545454;
                                      line-height: 1.2em;
                                      font-size: 1.1em;
                                      font-weight: 700;
                                    "
                                  >
                                    ${user.id}
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr style="text-align: center">
                                  <td class="logo-wrapper">
                                    <img
                                      src="${data.logourl}"
                                      width="100%"
                                      height="100%"
                                      class="img-fluid logo"
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr style="text-align: center">
                                  <td
                                    style="
                                      color: #000;
                                      line-height: 1.1em;
                                      font-size: 1.6em;
                                      font-weight: 700;
                                    "
                                  >
                                    ${data.date}
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr>
                                  <td
                                    height="15"
                                    style="border-top: 1px solid #000"
                                  ></td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr style="text-align: center">
                                  <td
                                    style="
                                      color: #000;
                                      line-height: 1.1em;
                                      font-size: 1.6em;
                                      font-weight: 700;
                                    "
                                  >
                                    VENUE ADDRESS
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr style="text-align: center">
                                  <td style="color: #000; font-size: 1.2em">
                                    ${data.address}
                                  </td>
                                </tr>
                                <tr>
                                  <td>&nbsp;</td>
                                </tr>
                                <tr style="text-align: center">
                                  <td>
                                    <a
                                      href="${data.location}"
                                      target="_blank"
                                      style="color: #fff; text-decoration: none"
                                      ><button
                                        type="button"
                                        class="btnclick"
                                        style="
                                          width: 50%;
                                          padding: 10px;
                                          background: #393464ed;
                                          font-weight: 700;
                                          border: none;
                                          color: #fff;
                                          border-radius: 7px;
                                        "
                                      >
                                        <span
                                          ><i
                                            class="fas fa-angle-double-right"
                                          ></i
                                        ></span>
                                        Google Map Location
                                      </button>
                                    </a>
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr style="text-align: center">
                                  <td
                                    style="
                                      color: #000;
                                      line-height: 1.1em;
                                      font-size: 1.6em;
                                      font-weight: 700;
                                    "
                                  >
                                    Event Entry: ${data.time}
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr>
                                  <td height="15"></td>
                                </tr>
                                <tr style="text-align: center">
                                  <td>
                                    <a
                                      href="${data.details}"
                                      target="_blank"
                                      style="color: #fff; text-decoration: none"
                                      ><button
                                        type="button"
                                        class="btnclick"
                                        style="
                                          width: 50%;
                                          padding: 10px;
                                          background: #393464ed;
                                          font-weight: 700;
                                          border: none;
                                          color: #fff;
                                          border-radius: 7px;
                                        "
                                      >
                                        <span
                                          ><i
                                            class="fas fa-angle-double-right"
                                          ></i
                                        ></span>
                                        Click here to view event details
                                      </button>
                                    </a>
                                  </td>
                                </tr>

                                <tr>
                                  <td height="15">&nbsp;</td>
                                </tr>
                                <!-- <tr>
                                                <td height="15">&nbsp;</td>
                                            </tr> -->
                                <!-- <tr>
                                                <td style="font-size: 1em; line-height: 1.2em; text-align: center;border-top: 1px solid #000;">
                                                    <p style="margin-bottom: 0;line-height: 1.5;font-weight: bold;font-size: 1.2em;">
                                                        Pre-Booked Meal Coupons: For your convenience, pre-booked meal coupons are available at a cost of Rs 500. These coupons include full-day access to coffee, water, lunch, tea, and more.

                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="15"></td>
                                            </tr>
                                            <tr>
                                                <td height="15"></td>
                                            </tr>
                                            <tr style="text-align:center">
                                                <td>
                                                    <a href="https://rzp.io/l/pYenOoxx8" target="_blank" style="color: #fff; text-decoration: none;"><button type="button" class="btnclick" style="width: 50%;padding: 10px;background: #393464ed; font-weight: 700; border: none;color: #fff;border-radius: 7px;">
                                                    <span><i class="fas fa-angle-double-right"></i></span> Book Now</button>
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td height="15"></td>
                                            </tr> -->

                                <tr>
                                  <td height="15">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td
                                    style="
                                      font-size: 1em;
                                      line-height: 1.2em;
                                      text-align: center;
                                      border-top: 1px solid #000;
                                    "
                                  >
                                    <p style="margin-bottom: 0">
                                      For any queries contact : ${data.mobno1} 
                                      ${data.mobno2 != 'null' ? ` / ` + data.mobno2 :""}
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                          <td width="5%"></td>
                        </tr>
                        <tr class="noprint2">
                          <td height="15">&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <table
      width="600"
      border="0"
      cellspacing="0"
      cellpadding="0"
      align="center"
      background="https://ci3.googleusercontent.com/meips/ADKq_NYXOeCz-9wPU31clhgzOWutn2S7aUEANh0_qepRTG_eG8azn07FGUYRUClEppBEI4pfHTZJNu5UOZ2gMO_4CNq1x4zzr1KidZfXyaDOR58=s0-d-e1-ft#https://entrypass.bllconnect.org/assets/images/bgImg.jpeg"
    >
      <tbody>
        <tr>
          <td
            style="
              border-right: #e6e6e6 solid 1px;
              border-left: #e6e6e6 solid 1px;
              border-top: #e6e6e6 solid 1px;
              border-bottom: #e6e6e6 solid 1px;
              padding-top: 15px;
              padding-left: 15px;
              padding-right: 15px;
              padding-bottom: 15px;
            "
          >
            <table
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              style="
                border-right: gold solid 4px;
                border-left: gold solid 4px;
                border-top: gold solid 4px;
                border-bottom: gold solid 4px;
                background-color: #fff;
              "
            >
              <tbody>
                <tr>
                  <td height="15"></td>
                </tr>
                <tr>
                  <td>
                    <table
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                    >
                      <tbody>
                        <tr>
                          <td width="5%"></td>
                          <td width="90%">
                            <table
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td height="15"></td>
                                </tr>

                                <tr>
                                  <td height="15"></td>
                                </tr>

                                <tr style="text-align: left">
                                <td style="color: #000;  font-size:24px">
                                  ${dynamicContent}
                                </td>
                              </tr>

                                <tr>
                                  <td height="10"></td>
                                </tr>

                                <tr>
                                  <td height="10"></td>
                                </tr>

                                <tr>
                                  <td height="15">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td height="15">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td
                                    style="
                                      font-size: 1em;
                                      line-height: 1.2em;
                                      text-align: center;
                                      border-top: 1px solid #000;
                                    "
                                  >
                                    <p
                                      style="margin-bottom: 0; line-height: 1.5"
                                    >
                                      *This is auto-generated message from BLL
                                      Please don't reply to this message.<br />

                                      <span style="font-weight: bold">
                                        Business Leadership League</span
                                      >
                                      <br />
                                      <span>
                                       ${data.address}</span
                                      ><br />
                                      <span> </span>
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15">&nbsp;</td>
                                </tr>
                                <tr>
                                  <td
                                    style="
                                      font-size: 1em;
                                      line-height: 1.2em;
                                      text-align: center;
                                      border-top: 1px solid #000;
                                    "
                                  >
                                    <p style="margin-bottom: 0">
                                      For any queries contact : ${data.mobno1} 
                                      ${data.mobno2 != 'null' ? ` / ` + data.mobno2 :""}
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                          <td width="5%"></td>
                        </tr>
                        <tr>
                          <td height="15">&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td width="5%"></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

   
  </body>
</html>

  `;

  return template1;
};
