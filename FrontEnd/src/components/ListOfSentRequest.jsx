import React from "react";

import ViewSentRequest from "./ViewSentRequest";


export default class ListOfSentRequest extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    render() {
        return (
            <div className="AllBooks">
                <h2> Sent Requests: </h2>
                {this.props.requests.map((eachRequest) => {
                    this.state.data = eachRequest;
                    return (
                        <ViewSentRequest
                            requests={eachRequest}
                        />
                    );
                })}
            </div>
        );
    }
}