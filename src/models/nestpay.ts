import { ProcReturnCode, Response } from "./enum";

export type _3DPayHostingFailureResponse = {
	/**
	 * e.g "clientid:oid:mdStatus:cavv:eci:md:rnd:"
	 */
	HASHPARAMS: string;
	HASHPARAMSVAL: string;
	HASH: string;
	clientid: string;
	oid: string;
	/**
	 * e.g. "Not authenticated",
	 */
	mdErrorMsg: string;
	/**
	 * 3d operation status code
	 * e.g "1"
	 */
	mdStatus: string;
	/** Cardholder Authentication Verification Value*/
	cavv: string;
	/** Electronic Commerce Indicator */
	eci: string;
	md: string;
	rnd: string;
};

export type _3DPayHostingSuccessResponse = {
	/**
	 * e.g "Not authenticated",
	 */
	mdErrorMsg: string;
	/**
	 * e.g "clientid:oid:AuthCode:ProcReturnCode:Response:mdStatus:cavv:eci:md:rnd:"
	 */
	HASHPARAMS: string;
	HASH: string;
	HASHPARAMSVAL: string;
	clientid: string;
	oid: string;
	/**
	 * e.g "123456"
	 */
	AuthCode: string;
	ProcReturnCode: ProcReturnCode;
	Response: Response;
	/**
	 * 3d operation status code
	 * e.g "1"
	 */
	mdStatus: string;
	/** Cardholder Authentication Verification Value*/
	cavv: string;
	/** Electronic Commerce Indicator */
	eci: string;
	md: string;
	rnd: string;
	/**
	 * Bank reference number
	 */
	HostRefNum: number;
};

export type _3DPayHostingCallbackResponse = {
	/**
	 * e.g "Authenticated"
	 */
	mdErrorMsg: string;
	/**
	 * e.g "clientid:oid:AuthCode:ProcReturnCode:Response:mdStatus:cavv:eci:md:rnd:"
	 */
	HASHPARAMS: string;
	HASH: string;
	HASHPARAMSVAL: string;
	clientid: string;
	oid: string;
	/**
	 * e.g "123456"
	 */
	authCode: string;
	merchantName: string;
	ProcReturnCode: ProcReturnCode;
	Response: Response;
	/**
	 * 3d operation status code
	 * e.g "1"
	 */
	mdStatus: string;
	/** Cardholder Authentication Verification Value*/
	cavv: string;
	/** Electronic Commerce Indicator */
	eci: string;
	md: string;
	rnd: string;
	/** MPI error message */
	msErrorMsg: string;
};
