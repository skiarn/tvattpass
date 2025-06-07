# Tvattpass 

Tvättpass Is a washing booking web app

## Proto
protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out=./src/generated \
  --proto_path=./path/to bookings.proto
//import { Bookings, Booking } from './generated/bookings_pb';

