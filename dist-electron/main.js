import { createRequire } from "node:module";
import * as os from "os";
import fs from "fs";
import { exec } from "child_process";
import { dirname, join } from "path";
import { BrowserWindow, app, globalShortcut, ipcMain } from "electron";
import { fileURLToPath } from "url";
import { promisify } from "util";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* @__PURE__ */ createRequire(import.meta.url);
//#endregion
//#region node_modules/node-wifi/src/env.js
var require_env = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = Object.assign(process.env, {
		LANG: "en_US.UTF-8",
		LC_ALL: "en_US.UTF-8",
		LC_MESSAGES: "en_US.UTF-8"
	});
}));
//#endregion
//#region node_modules/node-wifi/src/utils/network-utils.js
var require_network_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	var channels = {};
	var frequency = 2412;
	for (let i = 1; i < 15; i++) {
		channels[i] = frequency.toString();
		frequency = frequency + 5;
	}
	frequency = 5180;
	for (let j = 36; j <= 64; j += 2) {
		channels[j] = frequency.toString();
		frequency += 10;
	}
	frequency = 5500;
	for (let k = 100; k <= 144; k += 2) {
		channels[k] = frequency.toString();
		frequency += 10;
	}
	frequency = 5745;
	for (let l = 149; l <= 161; l += 2) {
		channels[l] = frequency.toString();
		frequency += 10;
	}
	frequency = 5825;
	for (let m = 165; m <= 173; m += 4) {
		channels[m] = frequency.toString();
		frequency += 20;
	}
	function frequencyFromChannel(channelId) {
		return channels[parseInt(channelId)];
	}
	function dBFromQuality(quality) {
		return parseFloat(quality) / 2 - 100;
	}
	function qualityFromDB(db) {
		return 2 * (parseFloat(db) + 100);
	}
	exports.frequencyFromChannel = frequencyFromChannel;
	exports.dBFromQuality = dBFromQuality;
	exports.qualityFromDB = qualityFromDB;
}));
//#endregion
//#region node_modules/node-wifi/src/windows-scan.js
var require_windows_scan = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execFile$8 = __require("child_process").execFile;
	var networkUtils = require_network_utils();
	var env = require_env();
	function scanWifi(config, callback) {
		try {
			execFile$8("netsh", [
				"wlan",
				"show",
				"networks",
				"mode=Bssid"
			], { env }, (err, scanResults) => {
				if (err) {
					callback && callback(err);
					return;
				}
				scanResults = scanResults.toString("utf8").split("\r").join("").split("\n").slice(4, scanResults.length);
				let numNetworks = -1;
				let currentLine = 0;
				let networkTmp;
				const networksTmp = [];
				let network;
				const networks = [];
				let i;
				for (i = 0; i < scanResults.length; i++) if (scanResults[i] === "") {
					numNetworks++;
					networkTmp = scanResults.slice(currentLine, i);
					networksTmp.push(networkTmp);
					currentLine = i + 1;
				}
				for (i = 0; i < numNetworks; i++) if (networksTmp[i] && networksTmp[i].length > 0) {
					network = parse(networksTmp[i]);
					networks.push(network);
				}
				callback && callback(null, networks);
			});
		} catch (e) {
			callback && callback(e);
		}
	}
	function parse(networkTmp) {
		const network = {};
		network.mac = networkTmp[4] ? networkTmp[4].match(/.*?:\s(.*)/)[1] : "";
		network.bssid = network.mac;
		network.ssid = networkTmp[0] ? networkTmp[0].match(/.*?:\s(.*)/)[1] : "";
		network.channel = networkTmp[7] ? parseInt(networkTmp[7].match(/.*?:\s(.*)/)[1]) : -1;
		network.frequency = network.channel ? parseInt(networkUtils.frequencyFromChannel(network.channel)) : 0;
		network.signal_level = networkTmp[5] ? networkUtils.dBFromQuality(networkTmp[5].match(/.*?:\s(.*)/)[1]) : Number.MIN_VALUE;
		network.quality = networkTmp[5] ? parseFloat(networkTmp[5].match(/.*?:\s(.*)/)[1]) : 0;
		network.security = networkTmp[2] ? networkTmp[2].match(/.*?:\s(.*)/)[1] : "";
		network.security_flags = networkTmp[3] ? networkTmp[3].match(/.*?:\s(.*)/)[1] : "";
		network.mode = "Unknown";
		return network;
	}
	module.exports = (config) => {
		return (callback) => {
			if (callback) scanWifi(config, callback);
			else return new Promise((resolve, reject) => {
				scanWifi(config, (err, networks) => {
					if (err) reject(err);
					else resolve(networks);
				});
			});
		};
	};
}));
//#endregion
//#region node_modules/node-wifi/src/windows-connect.js
var require_windows_connect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var fs$1 = __require("fs");
	var execFile$7 = __require("child_process").execFile;
	var env = require_env();
	var scan = require_windows_scan();
	var path = __require("path");
	var os$1 = __require("os");
	var profileFilename = path.join(os$1.tmpdir(), "nodeWifiConnect.xml");
	function execCommand(cmd, params) {
		return new Promise((resolve, reject) => {
			execFile$7(cmd, params, {
				env,
				shell: true
			}, (err, stdout, stderr) => {
				if (err) {
					err.stdout = stdout;
					err.stderr = stderr;
					reject(err);
				} else resolve(stdout);
			});
		});
	}
	function connectToWifi(config, ap, callback) {
		scan(config)().then((networks) => {
			const selectedAp = networks.find((network) => {
				return network.ssid === ap.ssid;
			});
			if (selectedAp === void 0) throw "SSID not found";
			fs$1.writeFileSync(profileFilename, win32WirelessProfileBuilder(selectedAp, ap.password));
		}).then(() => {
			return execCommand("netsh", [
				"wlan",
				"add",
				"profile",
				`filename=${profileFilename}`
			]);
		}).then(() => {
			const cmd = "netsh";
			const params = [
				"wlan",
				"connect",
				`ssid="${ap.ssid}"`,
				`name="${ap.ssid}"`
			];
			if (config.iface) params.push(`interface="${config.iface}"`);
			return execCommand(cmd, params);
		}).then(() => {
			return execCommand(`del ${profileFilename}`);
		}).then(() => {
			callback && callback();
		}).catch((err) => {
			execFile$7("netsh", [
				"wlan",
				"delete",
				`profile "${ap.ssid}"`
			], { env }, () => {
				callback && callback(err);
			});
		});
	}
	function getHexSsid(plainTextSsid) {
		let i, j, ref, hex = "";
		for (i = j = 0, ref = plainTextSsid.length - 1; ref >= 0 ? j <= ref : j >= ref; i = ref >= 0 ? ++j : --j) hex += plainTextSsid.charCodeAt(i).toString(16);
		return hex;
	}
	function win32WirelessProfileBuilder(selectedAp, key) {
		let profile_content = `<?xml version="1.0"?> <WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1"> <name>${selectedAp.ssid}</name> <SSIDConfig> <SSID> <hex>${getHexSsid(selectedAp.ssid)}</hex> <name>${selectedAp.ssid}</name> </SSID> </SSIDConfig>`;
		if (selectedAp.security.includes("WPA2")) profile_content += `<connectionType>ESS</connectionType> <connectionMode>auto</connectionMode> <autoSwitch>true</autoSwitch> <MSM> <security> <authEncryption> <authentication>WPA2PSK</authentication> <encryption>AES</encryption> <useOneX>false</useOneX> </authEncryption> <sharedKey> <keyType>passPhrase</keyType> <protected>false</protected> <keyMaterial>${key}</keyMaterial> </sharedKey> </security> </MSM>`;
		else if (selectedAp.security.includes("WPA")) profile_content += `<connectionType>ESS</connectionType> <connectionMode>auto</connectionMode> <autoSwitch>true</autoSwitch> <MSM> <security> <authEncryption> <authentication>WPAPSK</authentication> <encryption>TKIP</encryption> <useOneX>false</useOneX> </authEncryption> <sharedKey> <keyType>passPhrase</keyType> <protected>false</protected> <keyMaterial>${key}</keyMaterial> </sharedKey> </security> </MSM>`;
		else if (selectedAp.security_flags.includes("WEP")) profile_content += `<connectionType>ESS</connectionType> <connectionMode>auto</connectionMode> <autoSwitch>true</autoSwitch> <MSM> <security> <authEncryption> <authentication>open</authentication> <encryption>WEP</encryption> <useOneX>false</useOneX> </authEncryption> <sharedKey> <keyType>networkKey</keyType> <protected>false</protected> <keyMaterial>${key}</keyMaterial> </sharedKey> </security> </MSM>`;
		else profile_content += "<connectionType>ESS</connectionType> <connectionMode>manual</connectionMode> <MSM> <security> <authEncryption> <authentication>open</authentication> <encryption>none</encryption> <useOneX>false</useOneX> </authEncryption> </security> </MSM>";
		profile_content += "</WLANProfile>";
		return profile_content;
	}
	module.exports = (config) => {
		return (ap, callback) => {
			if (callback) connectToWifi(config, ap, callback);
			else return new Promise((resolve, reject) => {
				connectToWifi(config, ap, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		};
	};
}));
//#endregion
//#region node_modules/node-wifi/src/windows-disconnect.js
var require_windows_disconnect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execFile$6 = __require("child_process").execFile;
	var env = require_env();
	function disconnect(config, callback) {
		const cmd = "netsh";
		const params = ["wlan", "disconnect"];
		if (config.iface) params.push(`interface="${config.iface}"`);
		execFile$6(cmd, params, { env }, (err) => {
			callback && callback(err);
		});
	}
	module.exports = (config) => {
		return (callback) => {
			if (callback) disconnect(config, callback);
			else return new Promise((resolve, reject) => {
				disconnect(config, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		};
	};
}));
//#endregion
//#region node_modules/node-wifi/src/windows-current-connections.js
var require_windows_current_connections = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execFile$5 = __require("child_process").execFile;
	var env = require_env();
	var networkUtils = require_network_utils();
	function parseShowInterfaces(stdout) {
		const lines = stdout.split("\r\n");
		const connections = [];
		let i = 3;
		while (lines.length > i + 18) {
			const tmpConnection = {};
			const fields = [
				"name",
				"description",
				"guid",
				"mac",
				"state",
				"ssid",
				"bssid",
				"mode",
				"radio",
				"authentication",
				"encryption",
				"connection",
				"channel",
				"reception",
				"transmission",
				"signal",
				"profil"
			];
			for (let j = 0; j < fields.length; j++) {
				const line = lines[i + j];
				tmpConnection[fields[j]] = line.match(/.*: (.*)/)[1];
			}
			connections.push({
				iface: tmpConnection.name,
				ssid: tmpConnection.ssid,
				bssid: tmpConnection.bssid,
				mac: tmpConnection.bssid,
				mode: tmpConnection.mode,
				channel: parseInt(tmpConnection.channel),
				frequency: parseInt(networkUtils.frequencyFromChannel(parseInt(tmpConnection.channel))),
				signal_level: networkUtils.dBFromQuality(tmpConnection.signal),
				quality: parseFloat(tmpConnection.signal),
				security: tmpConnection.authentication,
				security_flags: tmpConnection.encryption
			});
			i = i + 18;
		}
		return connections;
	}
	function getCurrentConnection(config, callback) {
		execFile$5("netsh", [
			"wlan",
			"show",
			"interfaces"
		], { env }, (err, stdout) => {
			if (err) callback && callback(err);
			else try {
				const connections = parseShowInterfaces(stdout, config);
				callback && callback(null, connections);
			} catch (e) {
				callback && callback(e);
			}
		});
	}
	module.exports = (config) => {
		return (callback) => {
			if (callback) getCurrentConnection(config, callback);
			else return new Promise((resolve, reject) => {
				getCurrentConnection(config, (err, connections) => {
					if (err) reject(err);
					else resolve(connections);
				});
			});
		};
	};
}));
//#endregion
//#region node_modules/node-wifi/src/linux-connect.js
var require_linux_connect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execFile$4 = __require("child_process").execFile;
	var env = require_env();
	function connectToWifi(config, ap, callback) {
		const args = [];
		args.push("-w");
		args.push("10");
		args.push("device");
		args.push("wifi");
		args.push("connect");
		args.push(ap.ssid);
		args.push("password");
		args.push(ap.password);
		if (config.iface) {
			args.push("ifname");
			args.push(config.iface);
		}
		execFile$4("nmcli", args, { env }, (err, resp) => {
			if (resp.includes("Error: ")) err = new Error(resp.replace("Error: ", ""));
			callback && callback(err);
		});
	}
	module.exports = (config) => {
		return (ap, callback) => {
			if (callback) connectToWifi(config, ap, callback);
			else return new Promise((resolve, reject) => {
				connectToWifi(config, ap, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		};
	};
}));
//#endregion
//#region node_modules/node-wifi/src/linux-disconnect.js
var require_linux_disconnect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execFile$3 = __require("child_process").execFile;
	var env = require_env();
	function disconnect(config, callback) {
		const args = [];
		args.push("device");
		args.push("disconnect");
		if (config.iface) args.push(config.iface);
		execFile$3("nmcli", args, { env }, (err) => {
			callback && callback(err);
		});
	}
	module.exports = (config) => {
		return (callback) => {
			if (callback) disconnect(config, callback);
			else return new Promise((resolve, reject) => {
				disconnect(config, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		};
	};
}));
//#endregion
//#region node_modules/node-wifi/src/linux-delete.js
var require_linux_delete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execFile$2 = __require("child_process").execFile;
	var env = require_env();
	function deleteConnection(config, ap, callback) {
		const args = [];
		args.push("connection");
		args.push("delete");
		args.push("id");
		args.push(ap.ssid);
		execFile$2("nmcli", args, env, (err) => {
			callback && callback(err);
		});
	}
	module.exports = (config) => {
		return (ap, callback) => {
			if (callback) deleteConnection(config, ap, callback);
			else return new Promise((resolve, reject) => {
				deleteConnection(config, ap, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		};
	};
}));
//#endregion
//#region node_modules/node-wifi/src/linux-current-connections.js
var require_linux_current_connections = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execFile$1 = __require("child_process").execFile;
	var networkUtils = require_network_utils();
	var env = require_env();
	function getCurrentConnection(config, callback) {
		const args = [];
		args.push("--terse");
		args.push("--fields");
		args.push("active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags,device");
		args.push("device");
		args.push("wifi");
		if (config.iface) {
			args.push("list");
			args.push("ifname");
			args.push(config.iface);
		}
		execFile$1("nmcli", args, { env }, (err, scanResults) => {
			if (err) {
				callback && callback(err);
				return;
			}
			const lines = scanResults.split("\n");
			const networks = [];
			for (let i = 0; i < lines.length; i++) if (lines[i] != "") {
				const fields = lines[i].replace(/\\:/g, "&&").split(":");
				if (fields[0] == "yes") networks.push({
					iface: fields[10].replace(/&&/g, ":"),
					ssid: fields[1].replace(/&&/g, ":"),
					bssid: fields[2].replace(/&&/g, ":"),
					mac: fields[2].replace(/&&/g, ":"),
					mode: fields[3].replace(/&&/g, ":"),
					channel: parseInt(fields[4].replace(/&&/g, ":")),
					frequency: parseInt(fields[5].replace(/&&/g, ":")),
					signal_level: networkUtils.dBFromQuality(fields[6].replace(/&&/g, ":")),
					quality: parseFloat(fields[6].replace(/&&/g, ":")),
					security: fields[7].replace(/&&/g, ":"),
					security_flags: {
						wpa: fields[8].replace(/&&/g, ":"),
						rsn: fields[9].replace(/&&/g, ":")
					}
				});
			}
			callback && callback(null, networks);
		});
	}
	module.exports = (config) => {
		return (callback) => {
			if (callback) getCurrentConnection(config, callback);
			else return new Promise((resolve, reject) => {
				getCurrentConnection(config, (err, connections) => {
					if (err) reject(err);
					else resolve(connections);
				});
			});
		};
	};
}));
//#endregion
//#region node_modules/node-wifi/src/utils/executer.js
var require_executer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { execFile } = __require("child_process");
	var env = require_env();
	module.exports = ({ cmd, args }) => new Promise((resolve, reject) => {
		execFile(cmd, args, { env }, (error, output) => {
			if (error) reject(error);
			else resolve(output);
		});
	});
}));
//#endregion
//#region node_modules/node-wifi/src/utils/promiser.js
var require_promiser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var extractArgs = (allArgs) => {
		const callbackIndex = allArgs.length - 1;
		if (callbackIndex >= 0 && typeof allArgs[callbackIndex] === "function") return {
			callback: allArgs[callbackIndex],
			args: allArgs.slice(0, callbackIndex)
		};
		return {
			callback: null,
			args: allArgs
		};
	};
	module.exports = (func) => (config) => (...allArgs) => {
		const { args, callback } = extractArgs(allArgs);
		if (typeof callback === "function") func(config, ...args).then((response) => {
			callback(null, response);
		}).catch((error) => {
			callback(error);
		});
		else return func(config, ...args);
	};
}));
//#endregion
//#region node_modules/node-wifi/src/linux/scan/command.js
var require_command$4 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var command = (config) => {
		const args = [
			"--terse",
			"--fields",
			"active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags",
			"device",
			"wifi",
			"list"
		];
		if (config.iface) {
			args.push("ifname");
			args.push(config.iface);
		}
		return {
			cmd: "nmcli",
			args
		};
	};
	module.exports = command;
}));
//#endregion
//#region node_modules/node-wifi/src/utils/percentage-db.js
var require_percentage_db = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var percentageFromDB = (db) => 2 * (parseFloat(db) + 100);
	var dBFromPercentage = (quality) => parseFloat(quality) / 2 - 100;
	module.exports = {
		percentageFromDB,
		dBFromPercentage
	};
}));
//#endregion
//#region node_modules/node-wifi/src/linux/scan/parser.js
var require_parser$3 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { dBFromPercentage } = require_percentage_db();
	var matchBssid = (line) => line.match(/[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}/);
	var parse = (stdout) => stdout.split("\n").filter((line) => line !== "" && line.includes(":")).filter((line) => matchBssid(line)).map((line) => {
		const match = matchBssid(line);
		const bssid = match[0].replace(/\\:/g, ":");
		const [active, ssid, bssidAlreadyProcessed, mode, channel, frequency, quality, security, security_flags_wpa, security_flags_rsn] = line.replace(match[0]).split(":");
		return {
			ssid,
			bssid,
			mac: bssid,
			mode,
			channel: parseInt(channel),
			frequency: parseInt(frequency),
			signal_level: dBFromPercentage(quality),
			quality: parseInt(quality),
			security: security !== "(none)" ? security : "none",
			security_flags: {
				wpa: security_flags_wpa,
				rsn: security_flags_rsn
			}
		};
	});
	module.exports = parse;
}));
//#endregion
//#region node_modules/node-wifi/src/linux-scan.js
var require_linux_scan = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execute = require_executer();
	var promiser = require_promiser();
	var command = require_command$4();
	var parse = require_parser$3();
	var scanWifi = (config) => execute(command(config)).then((output) => parse(output));
	module.exports = promiser(scanWifi);
}));
//#endregion
//#region node_modules/node-wifi/src/macOS/connect/command.js
var require_command$3 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var command = (config, accessPoint) => {
		const args = ["-setairportnetwork"];
		args.push(config.iface || "en0");
		args.push(accessPoint.ssid);
		args.push(accessPoint.password);
		return {
			cmd: "/usr/sbin/networksetup",
			args
		};
	};
	module.exports = command;
}));
//#endregion
//#region node_modules/node-wifi/src/mac-connect.js
var require_mac_connect = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execute = require_executer();
	var promiser = require_promiser();
	var connectWifiCommand = require_command$3();
	var connectWifi = (config, accessPoint) => execute(connectWifiCommand(config, accessPoint));
	module.exports = promiser(connectWifi);
}));
//#endregion
//#region node_modules/node-wifi/src/macOS/scan/command.js
var require_command$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var command = () => ({
		cmd: "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport",
		args: ["--scan"]
	});
	module.exports = command;
}));
//#endregion
//#region node_modules/node-wifi/src/utils/frequency-from-channel.js
var require_frequency_from_channel = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var channels = {};
	var frequency = 2412;
	for (let i = 1; i < 15; i++) {
		channels[i] = frequency;
		frequency = frequency + 5;
	}
	frequency = 5180;
	for (let j = 36; j <= 64; j += 2) {
		channels[j] = frequency;
		frequency += 10;
	}
	frequency = 5500;
	for (let k = 100; k <= 144; k += 2) {
		channels[k] = frequency;
		frequency += 10;
	}
	frequency = 5745;
	for (let l = 149; l <= 161; l += 2) {
		channels[l] = frequency;
		frequency += 10;
	}
	frequency = 5825;
	for (let m = 165; m <= 173; m += 4) {
		channels[m] = frequency;
		frequency += 20;
	}
	module.exports = (channel) => channels[parseInt(channel)];
}));
//#endregion
//#region node_modules/node-wifi/src/macOS/scan/parser.js
var require_parser$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { percentageFromDB } = require_percentage_db();
	var frequencyFromChannel = require_frequency_from_channel();
	var isNotEmpty = (line) => line.trim() !== "";
	var parseSecurity = (security) => {
		const securities = security === "NONE" ? [{
			protocole: "NONE",
			flag: ""
		}] : security.split(" ").map((s) => s.match(/(.*)\((.*)\)/)).filter(Boolean).map(([, protocole, flag]) => ({
			protocole,
			flag
		}));
		return {
			security: securities.map((s) => s.protocole).join(" "),
			security_flags: securities.filter((s) => s.flag).map((s) => `(${s.flag})`)
		};
	};
	var parse = (stdout) => {
		const [, ...otherLines] = stdout.split("\n");
		return otherLines.filter(isNotEmpty).map((line) => line.trim()).map((line) => {
			const match = line.match(/(.*)\s+([a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}:[a-zA-Z0-9]{2}|)\s+(-[0-9]+)\s+([0-9]+).*\s+([A-Z]+)\s+([a-zA-Z-]+)\s+([A-Z0-9(,)\s/]+)/);
			if (match) {
				const [, ssid, bssid, rssi, channelStr, ht, countryCode, security] = match;
				const channel = parseInt(channelStr);
				return {
					mac: bssid,
					bssid,
					ssid: ssid.trim(),
					channel,
					frequency: frequencyFromChannel(channel),
					signal_level: rssi,
					quality: percentageFromDB(rssi),
					...parseSecurity(security)
				};
			}
			return false;
		}).filter(Boolean);
	};
	module.exports = parse;
}));
//#endregion
//#region node_modules/node-wifi/src/mac-scan.js
var require_mac_scan = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execute = require_executer();
	var promiser = require_promiser();
	var command = require_command$2();
	var parse = require_parser$2();
	var scanWifi = (config) => execute(command(config)).then((output) => parse(output));
	module.exports = promiser(scanWifi);
}));
//#endregion
//#region node_modules/node-wifi/src/macOS/delete/command.js
var require_command$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var command = (config, accessPoint) => {
		const args = ["-removepreferredwirelessnetwork"];
		args.push(config.iface || "en0");
		args.push(accessPoint.ssid);
		return {
			cmd: "/usr/sbin/networksetup",
			args
		};
	};
	module.exports = command;
}));
//#endregion
//#region node_modules/node-wifi/src/macOS/delete/parser.js
var require_parser$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var parse = (stdout) => {
		if (stdout && stdout.includes("was not found in the preferred networks list")) throw new Error(stdout.trim());
	};
	module.exports = parse;
}));
//#endregion
//#region node_modules/node-wifi/src/mac-delete.js
var require_mac_delete = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execute = require_executer();
	var promiser = require_promiser();
	var command = require_command$1();
	var parse = require_parser$1();
	var disconnectWifi = (config, accessPoint) => execute(command(config, accessPoint)).then((output) => parse(output));
	module.exports = promiser(disconnectWifi);
}));
//#endregion
//#region node_modules/node-wifi/src/macOS/current-connections/command.js
var require_command = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var command = () => ({
		cmd: "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport",
		args: ["--getinfo"]
	});
	module.exports = command;
}));
//#endregion
//#region node_modules/node-wifi/src/macOS/current-connections/parser.js
var require_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { percentageFromDB } = require_percentage_db();
	var frequencyFromChannel = require_frequency_from_channel();
	var agrCtlRSSIRegex = /[ ]*agrCtlRSSI: (.*)/;
	var BSSIDRegex = /[ ]*BSSID: ([0-9A-Fa-f:]*)/;
	var SSIDRegex = /[ ]*SSID: (.*)/;
	var securityRegex = /[ ]*link auth: (.*)/;
	var channelRegex = /[ ]*channel: (.*)/;
	var formatMacAddress = (mac) => mac.split(":").map((part) => part.length === 1 ? `0${part}` : part).join(":");
	var parse = (stdout) => {
		const lines = stdout.split("\n");
		const connections = [];
		let connection = {};
		lines.forEach((line) => {
			const matchAgrCtlRSSI = line.match(agrCtlRSSIRegex);
			if (matchAgrCtlRSSI) {
				connection.signal_level = parseInt(matchAgrCtlRSSI[1]);
				connection.quality = percentageFromDB(connection.signal_level);
				return;
			}
			const matchBSSID = line.match(BSSIDRegex);
			if (matchBSSID) {
				connection.bssid = formatMacAddress(matchBSSID[1]);
				connection.mac = connection.bssid;
				return;
			}
			const matchSSID = line.match(SSIDRegex);
			if (matchSSID) {
				connection.ssid = matchSSID[1];
				return;
			}
			const matchSecurity = line.match(securityRegex);
			if (matchSecurity) {
				connection.security = matchSecurity[1];
				connection.security_flags = [];
				return;
			}
			const matchChannel = line.match(channelRegex);
			if (matchChannel) {
				connection.channel = matchChannel[1];
				connection.frequency = frequencyFromChannel(connection.channel);
				connections.push(connection);
				connection = {};
			}
		});
		return connections;
	};
	module.exports = parse;
}));
//#endregion
//#region node_modules/node-wifi/src/mac-current-connections.js
var require_mac_current_connections = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var execute = require_executer();
	var promiser = require_promiser();
	var command = require_command();
	var parse = require_parser();
	var currentConnectionWifi = (config) => execute(command(config)).then((output) => parse(output));
	module.exports = promiser(currentConnectionWifi);
}));
//#endregion
//#region electron/main.js
var import_wifi = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports) => {
	var windowsConnect = require_windows_connect();
	var windowsScan = require_windows_scan();
	var windowsDisconnect = require_windows_disconnect();
	var windowsGetCurrentConnections = require_windows_current_connections();
	var linuxConnect = require_linux_connect();
	var linuxDisconnect = require_linux_disconnect();
	var linuxDelete = require_linux_delete();
	var linuxGetCurrentConnections = require_linux_current_connections();
	var linuxScan = require_linux_scan();
	var macConnect = require_mac_connect();
	var macScan = require_mac_scan();
	var macDelete = require_mac_delete();
	var macGetCurrentConnections = require_mac_current_connections();
	var config = {
		debug: false,
		iface: null
	};
	function init(options) {
		if (options && options.debug) config.debug = options.debug;
		if (options && options.iface) config.iface = options.iface;
		let scan = () => {
			throw new Error("ERROR : not available for this OS");
		};
		let connect = () => {
			throw new Error("ERROR : not available for this OS");
		};
		let disconnect = () => {
			throw new Error("ERROR : not available for this OS");
		};
		let deleteConnection = () => {
			throw new Error("ERROR : not available for this OS");
		};
		let getCurrentConnections = () => {
			throw new Error("ERROR : not available for this OS");
		};
		switch (process.platform) {
			case "linux":
				connect = linuxConnect(config);
				scan = linuxScan(config);
				disconnect = linuxDisconnect(config);
				deleteConnection = linuxDelete(config);
				getCurrentConnections = linuxGetCurrentConnections(config);
				break;
			case "darwin":
				connect = macConnect(config);
				scan = macScan(config);
				deleteConnection = macDelete(config);
				getCurrentConnections = macGetCurrentConnections(config);
				break;
			case "win32":
				connect = windowsConnect(config);
				scan = windowsScan(config);
				disconnect = windowsDisconnect(config);
				getCurrentConnections = windowsGetCurrentConnections(config);
				break;
			default: throw new Error("ERROR : UNRECOGNIZED OS");
		}
		exports.scan = scan;
		exports.connect = connect;
		exports.disconnect = disconnect;
		exports.deleteConnection = deleteConnection;
		exports.getCurrentConnections = getCurrentConnections;
	}
	exports.init = init;
	exports.scan = () => {
		throw new Error("ERROR : use init before");
	};
	exports.connect = () => {
		throw new Error("ERROR : use init before");
	};
	exports.disconnect = () => {
		throw new Error("ERROR : use init before");
	};
	exports.getCurrentConnections = () => {
		throw new Error("ERROR : use init before");
	};
	exports.deleteConnection = () => {
		throw new Error("ERROR : use init before");
	};
})))(), 1);
var execAsync = promisify(exec);
var __dirname = dirname(fileURLToPath(import.meta.url));
import_wifi.init({
	iface: null,
	tempDir: os.tmpdir()
});
function getEthernetStatus() {
	const interfaces = os.networkInterfaces();
	for (const [name, netInterface] of Object.entries(interfaces)) {
		if (!netInterface) continue;
		if (netInterface.some((int) => int.internal)) continue;
		const lowerName = name.toLowerCase();
		if (lowerName.includes("eth") || lowerName.includes("en") || lowerName.includes("ethernet")) {
			if (netInterface.some((int) => int.address && !int.internal)) return true;
		}
	}
	return false;
}
function createWindow() {
	let preloadPath = join(__dirname, "preload.js");
	if (!fs.existsSync(preloadPath)) if (fs.existsSync(join(__dirname, "preload.mjs"))) preloadPath = join(__dirname, "preload.mjs");
	else preloadPath = join(__dirname, "../src/preload.js");
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			devTools: true,
			webviewTag: true,
			contextIsolation: true,
			sandbox: true,
			nodeIntegration: false,
			nodeIntegrationInWorker: false,
			backgroundThrottling: true,
			preload: preloadPath
		}
	});
	win.maximize();
	if (app.isPackaged) win.loadFile(join(__dirname, "../dist/index.html"));
	else {
		win.loadURL("http://localhost:5173");
		win.removeMenu();
		win.webContents.openDevTools({ mode: "detach" });
		win.webContents.on("did-fail-load", () => {
			win.webContents.reloadIgnoringCache();
		});
	}
}
ipcMain.handle("wifi:scan", async () => {
	try {
		return (await import_wifi.default.scan()).map((net) => ({
			ssid: net.ssid || "Hidden Network",
			signal: net.signal_level,
			isKnown: !!net.security && net.security !== "none",
			security: net.security
		}));
	} catch (error) {
		throw new Error(`Failed to scan Wi-Fi: ${error.message}`);
	}
});
ipcMain.handle("wifi:connect", async (_, { ssid, password }) => {
	try {
		await import_wifi.default.connect({
			ssid,
			password
		});
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error.message
		};
	}
});
ipcMain.handle("wifi:disconnect", async () => {
	try {
		await import_wifi.default.disconnect();
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error.message
		};
	}
});
ipcMain.handle("network:status", async () => {
	const ethernetConnected = getEthernetStatus();
	let wifiConnected = false;
	let activeSsid = null;
	let signalStrength = 0;
	try {
		if (process.platform === "win32") {
			const { stdout } = await execAsync("netsh wlan show interfaces");
			const ssidLine = stdout.split("\n").find((line) => line.includes("SSID") && !line.includes("BSSID"));
			const signalLine = stdout.split("\n").find((line) => line.includes("Signal"));
			if (ssidLine) {
				const rawSsid = ssidLine.split(":")[1];
				if (rawSsid && rawSsid.trim() !== "") {
					activeSsid = rawSsid.trim();
					wifiConnected = true;
				}
			}
			if (signalLine) {
				const rawSignal = signalLine.split(":")[1];
				if (rawSignal) signalStrength = parseInt(rawSignal.replace("%", "").trim(), 10) || 0;
			}
		} else {
			const currentConnections = await import_wifi.default.getCurrentConnections();
			if (currentConnections && currentConnections.length > 0) {
				wifiConnected = true;
				activeSsid = currentConnections[0].ssid;
				signalStrength = currentConnections[0].signal_level;
			}
		}
	} catch (e) {
		console.error("Error patching native network status:", e);
	}
	return {
		ethernetConnected,
		wifiConnected,
		activeSsid,
		signalStrength: isNaN(signalStrength) ? 0 : signalStrength
	};
});
ipcMain.handle("fetch-rss", async (_event, feedUrl) => {
	return new Promise((resolve, reject) => {
		const request = net.request(feedUrl);
		let body = "";
		request.on("response", (response) => {
			if (response.statusCode < 200 || response.statusCode >= 300) {
				reject(/* @__PURE__ */ new Error(`RSS fetch failed: HTTP ${response.statusCode} for ${feedUrl}`));
				return;
			}
			response.on("data", (chunk) => {
				body += chunk.toString();
			});
			response.on("end", () => {
				resolve(body);
			});
		});
		request.on("error", (err) => {
			reject(/* @__PURE__ */ new Error(`RSS fetch network error for ${feedUrl}: ${err.message}`));
		});
		request.end();
	});
});
app.whenReady().then(() => {
	createWindow();
	globalShortcut.register("F11", () => {
		const win = BrowserWindow.getFocusedWindow();
		if (win) win.setFullScreen(!win.isFullScreen());
	});
	globalShortcut.register("F12", () => {
		const win = BrowserWindow.getFocusedWindow();
		if (win) win.webContents.toggleDevTools();
	});
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		globalShortcut.unregisterAll();
		app.quit();
	}
});
app.on("will-quit", () => globalShortcut.unregisterAll());
//#endregion
export {};
